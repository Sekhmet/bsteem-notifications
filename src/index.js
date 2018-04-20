const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const { createQueue } = require('./queue');
const fetcher = require('./fetcher');
const initializer = require('./initializer');
const router = require('./routes');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.json());

async function start() {
  mongoose.connect('mongodb://localhost/bsteem');
  const queue = await createQueue();

  fetcher(queue);
  initializer(queue);

  app.locals.queue = queue;
  app.use('/', router);

  app.listen(PORT);
}

start();
