const _ = require('lodash');
const api = require('../api');

async function fetchBatch(batch) {
  const requests = batch.map(block => ({
    method: 'get_ops_in_block',
    params: [block],
  }));

  return await api.sendBatchAsync(requests, null).reduce((a, b) => [...a, ...b], []);
}

module.exports = fetchBatch;
