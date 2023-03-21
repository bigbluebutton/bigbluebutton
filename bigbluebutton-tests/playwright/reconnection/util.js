const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const parameters = require('../core/parameters.js');

const hostname = new URL(parameters.server).hostname;

async function killConnection() {
  await exec('sudo ss -K dst ' + hostname + ' dport https');
}

exports.killConnection = killConnection;
