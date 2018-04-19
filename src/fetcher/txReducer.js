const _ = require('lodash');

function createNotification(type, timestamp, toUser, data) {
  return {
    type,
    timestamp,
    toUser,
    data,
  };
}

// Notification format
// const notification = {
//   type: 'vote',
//   timestamp: '2018-02-23T12:13:18',
//   toUser: 'sekhmet',
//   data: { txData }
// }

module.exports = function txReducer(a, tx) {
  const name = _.get(tx, 'op[0]');
  const data = _.get(tx, 'op[1]');

  if (!name || !data) return a;

  switch (name) {
    case 'transfer':
      return [
        ...a,
        createNotification('transfer_out', tx.timestamp, data.from, data),
        createNotification('transfer_in', tx.timestamp, data.to, data),
      ];
    case 'vote':
      if (data.voter === data.author) {
        return a;
      }

      return [...a, createNotification('vote', tx.timestamp, data.author, data)];
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

          return [...a, createNotification('reblog', tx.timestamp, author, customData)];
        }
        case 'follow': {
          const follower = _.get(customData, 'follower');
          const following = _.get(customData, 'following');

          if (!follower || !following) {
            return a;
          }

          return [...a, createNotification('follow', tx.timestamp, following, customData)];
        }
        default:
          return a;
      }
    }
    default:
      return a;
  }
};
