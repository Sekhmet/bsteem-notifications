const api = require('../api');

async function fetchBatch(batch) {
  return await api.sendAsync('get_ops_in_block', [batch[0]]);
}

module.exports = fetchBatch;
