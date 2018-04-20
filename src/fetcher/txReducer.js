const _ = require('lodash');
const {
  TYPE_VOTE,
  TYPE_TRANSFER_IN,
  TYPE_TRANSFER_OUT,
  TYPE_REPLY,
  TYPE_MENTION,
  TYPE_FOLLOW,
  TYPE_REBLOG,
} = require('../constants');

const MENTION_REGEX = /@([a-z][-.a-z\d]+[a-z\d])/gi;

function createNotification(type, timestamp, toUser, data) {
  return {
    type,
    timestamp,
    toUser,
    data,
  };
}

module.exports = function txReducer(a, tx) {
  const name = _.get(tx, 'op[0]');
  const data = _.get(tx, 'op[1]');

  if (!name || !data) return a;

  switch (name) {
    case 'transfer':
      return [
        ...a,
        createNotification(TYPE_TRANSFER_IN, tx.timestamp, data.to, data),
        createNotification(TYPE_TRANSFER_OUT, tx.timestamp, data.from, data),
      ];
    case 'vote':
      if (data.voter === data.author && data.weight !== 0) {
        return a;
      }

      return [...a, createNotification(TYPE_VOTE, tx.timestamp, data.author, data)];

    case 'comment':
      if (_.get(data, 'parent_author')) {
        return [...a, createNotification(TYPE_REPLY, tx.timestamp, data.parent_author, data)];
      }

      return [
        ...a,
        ..._.uniq(data.body.match(MENTION_REGEX))
          .slice(0, 11)
          .map(mention =>
            createNotification(TYPE_MENTION, tx.timestamp, mention.toLowerCase().slice(1), data),
          ),
      ];
    case 'custom_json': {
      if (_.get(data, 'id') !== 'follow') return a;

      const jsonData = _.attempt(JSON.parse, _.get(data, 'json'));

      if (_.isError(jsonData)) return a;

      const customName = _.get(jsonData, '[0]');
      const customData = _.get(jsonData, '[1]');

      if (!customName || !customData) return a;

      switch (customName) {
        case 'reblog': {
          const account = _.get(customData, 'account');
          const author = _.get(customData, 'author');

          if (!account || !author) {
            return a;
          }

          return [...a, createNotification(TYPE_REBLOG, tx.timestamp, author, customData)];
        }
        case 'follow': {
          const follower = _.get(customData, 'follower');
          const following = _.get(customData, 'following');
          const what = _.get(customData, 'what[0]');

          if (!follower || !following || what !== 'blog') {
            return a;
          }

          return [...a, createNotification(TYPE_FOLLOW, tx.timestamp, following, customData)];
        }
        default:
          return a;
      }
    }
    default:
      return a;
  }
};
