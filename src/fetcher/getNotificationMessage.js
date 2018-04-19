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
        title: `${data.voter} upvoted your post.`,
      };
      break;
    case TYPE_TRANSFER_IN:
      message = {
        title: `${data.from} sent you ${data.amount}.`,
      };
      break;
    case TYPE_TRANSFER_OUT:
      message = {
        title: `You sent ${data.amount} to ${data.to}.`,
      };
      break;
    case TYPE_FOLLOW:
      message = {
        title: `${data.follower} started following you.`,
      };
      break;
    case TYPE_REBLOG:
      message = {
        title: `${data.account} reposted your post.`,
      };
      break;
    default:
      message = {
        title: 'Something happened in the app.',
      };
  }

  return Object.assign({}, template, message);
};
