const debug = require('debug')('bsteem-notifications:fetcher');
const RSMQWorker = require('rsmq-worker');
const retry = require('async-retry');
const { STREAM_FETCHERS_QUEUE, PAST_FETCHERS_QUEUE } = require('../constants');
const txReducer = require('./txReducer');
const fetchBatch = require('./fetchBatch');

function createProcessBatch(name) {
  return async (msg, next, id) => {
    try {
      await retry(
        async () => {
          debug(name, 'Processing message:', id);
          const txs = await fetchBatch(msg.split(' '));

          const notifications = txs.reduce(txReducer, []);

          debug('notifications', notifications);

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

function worker(rsmq, name, queueUpvote) {
  const worker = new RSMQWorker(name, {
    rsmq,
    timeout: 10000,
  });
  worker.on('message', createProcessBatch(name, queueUpvote));
  worker.start();
}

function start(queue) {
  debug('fetcher started');

  worker(queue.rsmq, STREAM_FETCHERS_QUEUE);
  worker(queue.rsmq, PAST_FETCHERS_QUEUE);
}

module.exports = start;
