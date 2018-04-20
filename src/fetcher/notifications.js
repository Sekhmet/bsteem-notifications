const _ = require('lodash');
const { Token } = require('../models');

async function getUsersTokens(notifications) {
  const usernames = _.uniq(_.map(notifications, notification => notification.toUser));

  const tokens = await Token.find({ owner: { $in: usernames } });

  const usersTokens = {};

  tokens.forEach(token => {
    if (!usersTokens[token.owner]) {
      usersTokens[token.owner] = [];
    }

    usersTokens[token.owner].push(token.value);
  });

  return usersTokens;
}

async function getActiveNotifications(notifications) {
  const usersTokens = await getUsersTokens(notifications);

  return _.reduce(
    notifications,
    (a, b) => {
      if (!usersTokens[b.toUser]) {
        return a;
      }

      return [...a, b];
    },
    [],
  );
}

async function getPushNotifications(notifications) {
  const usersTokens = await getUsersTokens(notifications);

  return _.reduce(
    notifications,
    (a, b) => {
      const tokens = usersTokens[b.toUser];

      return [
        ...a,
        ..._.map(tokens, token =>
          Object.assign(
            {
              token,
            },
            b,
          ),
        ),
      ];
    },
    [],
  );
}

const {
  TYPE_VOTE,
  TYPE_TRANSFER_IN,
  TYPE_TRANSFER_OUT,
  TYPE_REPLY,
  TYPE_MENTION,
  TYPE_FOLLOW,
  TYPE_REBLOG,
} = require('../constants');

function getNotificationMessage(notification) {
  const data = notification.data;

  const template = { to: notification.token, data };
  let message = {};

  switch (notification.type) {
    case TYPE_VOTE:
      message = {
        body: `${data.voter} upvoted your post.`,
      };
      break;
    case TYPE_TRANSFER_IN:
      message = {
        body: `${data.from} sent you ${data.amount}.`,
      };
      break;
    case TYPE_TRANSFER_OUT:
      message = {
        body: `You sent ${data.amount} to ${data.to}.`,
      };
      break;
    case TYPE_REPLY:
      message = {
        body: `${data.author} replied to your post.`,
      };
      break;
    case TYPE_MENTION:
      message = {
        body: `${data.author} mentioned you in their post.`,
      };
      break;
    case TYPE_FOLLOW:
      message = {
        body: `${data.follower} started following you.`,
      };
      break;
    case TYPE_REBLOG:
      message = {
        body: `${data.account} reposted your post.`,
      };
      break;
    default:
      message = {
        body: 'Something happened in the app.',
      };
  }

  return Object.assign({}, template, message);
}

module.exports = {
  getActiveNotifications,
  getPushNotifications,
  getNotificationMessage,
};
