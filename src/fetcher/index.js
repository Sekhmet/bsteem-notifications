const debug = require('debug')('bsteem-notifications:fetcher');
const RSMQWorker = require('rsmq-worker');
const Expo = require('expo-server-sdk');
const { STREAM_FETCHERS_QUEUE, PAST_FETCHERS_QUEUE } = require('../constants');
const fetchBatch = require('./fetchBatch');
const txReducer = require('./txReducer');
const mapToToken = require('./mapToToken');
const getNotificationMessage = require('./getNotificationMessage');

const expo = new Expo();

function createProcessBatch(name, getUsersToken) {
  return async (msg, next, id) => {
    debug(name, 'Processing message:', id);
    const txs = await fetchBatch(msg.split(' '));

    const notifications = txs.reduce(txReducer, []);

    const activeNotifications = await mapToToken(notifications, getUsersToken);

    const messages = activeNotifications.map(getNotificationMessage);

    console.log('messages', messages);

    const chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      const resp = await expo.sendPushNotificationsAsync(chunk);
      debug('chunk sent', resp);
    }

    next();
  };
}

function worker(rsmq, name, getUsersToken) {
  const worker = new RSMQWorker(name, {
    rsmq,
    timeout: 10000,
  });
  worker.on('message', createProcessBatch(name, getUsersToken));
  worker.start();
}

function start(queue) {
  debug('fetcher started');

  worker(queue.rsmq, STREAM_FETCHERS_QUEUE, queue.getUsersToken);
  worker(queue.rsmq, PAST_FETCHERS_QUEUE, queue.getUsersToken);
}

module.exports = start;
