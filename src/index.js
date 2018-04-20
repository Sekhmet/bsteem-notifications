const _ = require('lodash');
const Bluebird = require('bluebird');
const express = require('express');
const bodyParser = require('body-parser');
const Expo = require('expo-server-sdk');
const sc2 = require('sc2-sdk');
const { createQueue } = require('./queue');
const fetcher = require('./fetcher');
const initializer = require('./initializer');
const router = require('./routes');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

async function start() {
  const queue = await createQueue();

  fetcher(queue);
  initializer(queue);

  app.locals.queue = queue;
  app.use('/', router);

  app.post('/register', async (req, res) => {
    const token = _.get(req, 'body.token');
    const username = _.get(req, 'body.username');
    const accessToken = _.get(req, 'body.accessToken');

    if (
      !token ||
      !username ||
      !accessToken ||
      !Expo.isExpoPushToken(token) ||
      typeof username !== 'string' ||
      typeof accessToken !== 'string'
    ) {
      return res.status(400).send({
        error: 'valid token, username, and accessToken are required',
      });
    }

    try {
      const api = sc2.Initialize({
        app: 'busy.app',
      });
      api.setAccessToken(accessToken);

      const me = Bluebird.promisify(api.me, { context: api });

      const user = await me();

      if (_.get(user, 'name') !== username) {
        return res.sendStatus(401);
      }

      await queue.registerUserDevice(username, token);
      return res.send({
        message: 'registered',
      });
    } catch (err) {
      return res.sendStatus(500);
    }
  });

  app.listen(PORT);
}

start();
