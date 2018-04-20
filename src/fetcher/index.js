const debug = require('debug')('bsteem-notifications:fetcher');
const RSMQWorker = require('rsmq-worker');
const Expo = require('expo-server-sdk');
const { STREAM_FETCHERS_QUEUE, PAST_FETCHERS_QUEUE } = require('../constants');
const { Notification } = require('../models');
const fetchBatch = require('./fetchBatch');
const txReducer = require('./txReducer');
const {
  getActiveNotifications,
  getPushNotifications,
  getNotificationMessage,
} = require('./notifications');

const expo = new Expo();

function createProcessBatch(queue, name) {
  return async (msg, next, id) => {
    debug(name, 'Processing message:', id);
    const txs = await fetchBatch(msg.split(' '));

    const notifications = txs.reduce(txReducer, []);

    const activeNotifications = await getActiveNotifications(notifications);
    await Notification.insertNotifications(activeNotifications);

    const pushNotifications = await getPushNotifications(notifications);
    const messages = pushNotifications.map(getNotificationMessage);

    const chunks = expo.chunkPushNotifications(messages);

    for (let chunk of chunks) {
      const resp = await expo.sendPushNotificationsAsync(chunk);
      debug('chunk sent', resp);
    }

    await queue.rsmq.deleteMessageAsync({ qname: name, id });

    next();
  };
}

function worker(queue, name) {
  const worker = new RSMQWorker(name, {
    rsmq: queue.rsmq,
    timeout: 10000,
  });
  worker.on('message', createProcessBatch(queue, name));
  worker.start();
}

function start(queue) {
  debug('fetcher started');

  worker(queue, STREAM_FETCHERS_QUEUE);
  worker(queue, PAST_FETCHERS_QUEUE);
}

module.exports = start;
