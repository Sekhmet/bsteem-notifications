const api = require('../api');

async function getLastIrreversibleBlock() {
  try {
    const resp = await api.sendAsync('get_dynamic_global_properties', []);
    return resp.head_block_number - 3;
  } catch (err) {
    return -1;
  }
}

module.exports = getLastIrreversibleBlock;
