import { exec as childExec } from 'node:child_process';
import process from 'node:process';
import * as util from 'node:util';

import { parameters } from '../core/parameters';

const { hostname } = parameters;

const exec = util.promisify(childExec);

interface TCPSession {
  local: { ip: string; port: number };
  remote: { ip: string; port: number };
  pid: number;
}

// Parse a line of output from the 'ss' program into an object
// with fields local (local IP address and TCP port), remote
// (remote address and port) and pid (localhost process ID)

function parseLine(line: string) {
  const fields = line.split(/\s+/);
  if (fields.length < 6) {
    throw new Error(`Invalid ss output format: expected at least 6 fields, got ${fields.length}`);
  }
  // These two are like '192.168.8.1:59164'
  const local = fields[3].split(/:/);
  const remote = fields[4].split(/:/);
  // This one is like 'users:(("chrome",pid=3346964,fd=118))'
  const processField = fields[5];
  const pidMatch = processField?.match(/pid=([0-9]+),/)?.[1];
  if (!pidMatch) {
    throw new Error(`Failed to extract PID from process field: ${processField}`);
  }
  const pid = parseInt(pidMatch, 10);
  return {
    local: { ip: local[0], port: parseInt(local[1], 10) },
    remote: { ip: remote[0], port: parseInt(remote[1], 10) },
    pid,
  };
}

// return an array of such structures for the current process
// and all of its subprocesses that connect to a given host

export async function getCurrentTCPSessions() {
  // First, get the process IDs of all of our subprocesses, which include the test browser(s).
  // The process IDs will appear in parenthesis after the command names in stdout.
  let stdout: string;
  try {
    ({ stdout } = await exec(`pstree -pn ${process.pid}`));
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get process tree: ${errMsg}. Ensure pstree is installed.`);
  }

  const processIDs = stdout.matchAll(/\(([0-9]+)\)/g);

  // Next, form a regular expression that matches all of those process IDs in ss's output format.
  //
  // The string matchAll method returned an iterator, which doesn't have a map method,
  // so we convert the iterator to a list, then map it to a expression which matches the pid
  // field in the output of ss, then join all the expressions together to form a regex.
  const foundRE = new RegExp([...processIDs].map((x) => `pid=${x[1]}`).join('|'));

  // Now get all TCP sessions going to the target host
  let stdout2: string;
  try {
    ({ stdout: stdout2 } = await exec(`ss -tpnH dst ${hostname}`));
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(`Failed to get TCP sessions: ${errMsg}. Ensure ss is installed and accessible.`);
  }
  return stdout2
    .split('\n')
    .filter((x) => foundRE.test(x))
    .map((x) => parseLine(x));
}

// takes an array of such structures and kills those TCP sessions

/**
 * Kills TCP sessions using sudo ss -K.
 * Requires passwordless sudo access for the ss command.
 * @param sessions - Array of TCP sessions to terminate
 * @throws Error if sudo is not configured or ss command fails
 */
export async function killTCPSessions(sessions: TCPSession[]): Promise<void> {
  if (sessions.length === 0) {
    return; // Nothing to kill
  }
  try {
    await exec(`sudo ss -K dst ${hostname} ${sessions.map((x) => `sport = ${x.local.port}`).join(' or ')}`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    throw new Error(
      `Failed to kill TCP sessions: ${errMsg}. Ensure passwordless sudo is configured for 'ss -K' command.`,
    );
  }
}
