const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const { hostname } = require('../core/parameters.js');

async function killConnection() {
  await exec(`
    sudo ss -K dst ${hostname} dport https;
    sudo iptables -A OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP;
    sleep 1;
    sudo iptables -D OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP;
  `);

}

exports.killConnection = killConnection;
