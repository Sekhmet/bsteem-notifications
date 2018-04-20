const Bluebird = require('bluebird');
const sc2 = require('sc2-sdk');

async function authMiddleware(req, res, next) {
  const token = req.get('Authorization');
  if (!token) {
    return res.sendStatus(401);
  }

  try {
    const api = sc2.Initialize({
      app: 'busy.app',
    });

    api.setAccessToken(token);

    const me = Bluebird.promisify(api.me, { context: api });

    const user = await me();

    if (!user) {
      return res.sendStatus(401);
    }

    req.user = user;

    next();
  } catch (err) {
    return res.sendStatus(401);
  }
}

module.exports = authMiddleware;
