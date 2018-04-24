const bluebird = require('bluebird');
const { createClient } = require('lightrpc');
const { API } = require('./constants');

const client = createClient(API);

bluebird.promisifyAll(client);

module.exports = client;
