const {
  TYPE_VOTE,
  TYPE_TRANSFER_IN,
  TYPE_TRANSFER_OUT,
  TYPE_FOLLOW,
  TYPE_REBLOG,
} = require('../constants');

module.exports = function getNotificationMessage(notification) {
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
};
