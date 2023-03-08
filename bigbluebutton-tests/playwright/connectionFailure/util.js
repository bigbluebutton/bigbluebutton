const util = require('node:util');
const exec = util.promisify(require('node:child_process').exec);
const process = require('node:process');

function parseline(line) {
  // Parse a line of output from the 'ss' program
  const fields = line.split(/\s+/);
  // These two are like '192.168.8.1:59164'
  const local = fields[3].split(/:/);
  const remote = fields[4].split(/:/);
  // This one is like 'users:(("chrome",pid=3346964,fd=118))'
  const process = fields[5];
  const pid = parseInt(process.match(/pid=([0-9]+),/)[1]);
  return { local: { ip: local[0], port: parseInt(local[1]) },
	   remote: { ip: remote[0], port: parseInt(remote[1]) },
           pid: pid };
}

async function getCurrentTCPSessions() {
  // First, get the process IDs of all of our subprocesses, which include the test browser(s).
  // The process IDs will appear in parenthesis after the command names in stdout.
  const { stdout } = await exec("pstree -pn " + process.pid);
  const processIDs = stdout.matchAll(/\(([0-9]+)\)/g);

  // Next, form a regular expression that matches all of those process IDs in ss's output format.
  //
  // The string matchAll method returned an iterator, which doesn't have a map method,
  // so we convert the iterator to a list, then map it to a expression which matches the pid
  // field in the output of ss, then join all the expressions together to form a regex.
  const foundRE = new RegExp([...processIDs].map(x => 'pid=' + x[1]).join('|'));

  // Now get all TCP sessions going to the target host
  const { stdout: stdout2 } = await exec("ss -tpnH dst focal-260.samsung");

  // Extract those TCP sessions attached to our subprocesses, parse and and return them in an array.
  return stdout2.split('\n').filter(x => foundRE.test(x)).map(x => parseline(x));
}

async function killTCPSessions(sessions) {
  await exec('sudo ss -K dst focal-260.samsung ' + sessions.map(x => 'sport = ' + x.local.port).join(' or '));
}

exports.getCurrentTCPSessions = getCurrentTCPSessions;
exports.killTCPSessions = killTCPSessions;
