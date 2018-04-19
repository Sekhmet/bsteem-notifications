const debug = require('debug')('bsteem-notifications:fetcher');
const RSMQWorker = require('rsmq-worker');
const retry = require('async-retry');
const { STREAM_FETCHERS_QUEUE, PAST_FETCHERS_QUEUE } = require('../constants');
const fetchBatch = require('./fetchBatch');
const txReducer = require('./txReducer');
const mapToToken = require('./mapToToken');
const getNotificationMessage = require('./getNotificationMessage');

function createProcessBatch(name, getUsersToken) {
  return async (msg, next, id) => {
    try {
      await retry(
        async () => {
          debug(name, 'Processing message:', id);
          const txs = await fetchBatch(msg.split(' '));

          const notifications = txs.reduce(txReducer, []);

          const activeNotifications = await mapToToken(notifications, getUsersToken);

          debug(activeNotifications.map(getNotificationMessage));

          next();
        },
        { retries: 5 },

        // TODO: Delete message.
      );
    } catch (err) {
      debug(name, "Couldn't fetch blocks. Message", id);
    }
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
