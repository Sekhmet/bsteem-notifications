const _ = require('lodash');
const debug = require('debug')('bsteem-notifications:queue');
const bluebird = require('bluebird');
const redis = require('redis');
const RedisSMQ = require('rsmq');
const { STREAM_FETCHERS_QUEUE, PAST_FETCHERS_QUEUE } = require('./constants');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(RedisSMQ.prototype);

async function createQueue() {
  const client = redis.createClient(process.env.REDISCLOUD_URL);

  const rsmq = new RedisSMQ({ client });
  try {
    const streamFetchersQueue = await rsmq.createQueueAsync({ qname: STREAM_FETCHERS_QUEUE });
    if (streamFetchersQueue === 1) {
      debug('created stream fetchers queue');
    }

    const pastFetchersQueue = await rsmq.createQueueAsync({ qname: PAST_FETCHERS_QUEUE });
    if (pastFetchersQueue === 1) {
      debug('created past fetchers queue');
    }
  } catch (err) {
    debug('queues not created');
  }

  return {
    rsmq,
    setCurrentBlock: block => client.setAsync('current_block', block),
    getCurrentBlock: () => client.getAsync('current_block'),
    getUsersRegistered: users => client.mgetAsync(users.map(user => `userRegistered:${user}`)),
    getUserTokens: user => client.smembersAsync(`userTokens:${user}`),
    registerUserDevice: async (user, token) => {
      await client.setAsync(`userRegistered:${user}`, true);
      await client.saddAsync(`userTokens:${user}`, token);
    },
    unregisterUserDevice: async (user, token) => {
      await client.sremAsync(`userTokens:${user}`, token);
      const tokensLeft = await client.scardAsync(`userTokens:${user}`);
      if (tokensLeft === 0) {
        await client.delAsync(`userRegistered:${user}`);
      }
    },
    stat: async () => {
      const queues = await rsmq.listQueuesAsync();
      return _.zipObject(
        queues,
        await Promise.all(queues.map(queue => rsmq.getQueueAttributesAsync({ qname: queue }))),
      );
    },
    queueStreamBatch: batch =>
      rsmq.sendMessageAsync({
        qname: STREAM_FETCHERS_QUEUE,
        message: batch.join(' '),
      }),
    queuePastBatch: batch =>
      rsmq.sendMessageAsync({
        qname: PAST_FETCHERS_QUEUE,
        message: batch.join(' '),
      }),
  };
}

module.exports = { createQueue };
