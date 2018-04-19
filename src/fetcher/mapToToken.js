const _ = require('lodash');

module.exports = async function mapToToken(notifications, getUsersToken) {
  const usernames = _.uniq(_.map(notifications, notification => notification.toUser));
  const dbUsers = await getUsersToken(usernames);

  let tokens = {};

  usernames.forEach((username, i) => {
    tokens[username] = dbUsers[i];
  });

  return _.reduce(
    notifications,
    (a, b) => {
      const token = tokens[b.toUser];

      if (!token) return a;

      return [
        ...a,
        Object.assign(
          {
            token,
          },
          b,
        ),
      ];
    },
    [],
  );
};
