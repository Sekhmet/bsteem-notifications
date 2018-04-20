const _ = require('lodash');
const { Token } = require('../models');

module.exports = async function mapToToken(notifications) {
  const usernames = _.uniq(_.map(notifications, notification => notification.toUser));

  const tokens = await Token.find({ owner: { $in: usernames } });

  const userTokens = {};

  tokens.forEach(token => {
    if (!userTokens[token.owner]) {
      userTokens[token.owner] = [];
    }

    userTokens[token.owner].push(token.value);
  });

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
