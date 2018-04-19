const _ = require('lodash');

module.exports = async function mapToToken(queue, notifications) {
  const usernames = _.uniq(_.map(notifications, notification => notification.toUser));
  const dbUsers = await queue.getUsersRegistered(usernames);

  const registeredUsers = _.reduce(
    usernames,
    (a, b, i) => {
      if (!dbUsers[i]) return a;

      return [...a, b];
    },
    [],
  );

  const userTokens = {};

  for (let user of registeredUsers) {
    userTokens[user] = await queue.getUserTokens(user);
  }

  return _.reduce(
    notifications,
    (a, b) => {
      const tokens = userTokens[b.toUser];

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
};
