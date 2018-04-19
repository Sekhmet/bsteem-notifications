const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const Expo = require('expo-server-sdk');
const { createQueue } = require('./queue');
const fetcher = require('./fetcher');
const initializer = require('./initializer');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

async function start() {
  const queue = await createQueue();

  fetcher(queue);
  initializer(queue);

  app.get('/', async (req, res) => res.send(await queue.stat()));
  app.post('/register', async (req, res) => {
    const token = _.get(req, 'body.token');
    const username = _.get(req, 'body.username');

    if (!token || !username || !Expo.isExpoPushToken(token) || typeof username !== 'string') {
      return res.status(400).send({
        error: 'valid token and username are required',
      });
    }

    try {
      await queue.registerUser(username, token);
      return res.send({
        message: 'registered',
      });
    } catch (err) {
      return res.sendStatus(501);
    }
  });

  app.listen(PORT);
}

start();
