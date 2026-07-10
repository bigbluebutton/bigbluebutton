import { exec as childExec } from 'node:child_process';
import * as util from 'node:util';

import { parameters } from '../core/parameters';

const { hostname } = parameters;

const exec = util.promisify(childExec);

export async function killConnection() {
  if (!hostname) {
    throw new Error('hostname is undefined; ensure BBB_URL is set');
  }
  if (!/^[a-zA-Z0-9.-]+$/.test(hostname)) {
    throw new Error(`Invalid hostname format: ${hostname}`);
  }

  try {
    await exec(`
      sudo ss -K dst ${hostname} dport https;
      sudo iptables -A OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP;
      sleep 1;
      sudo iptables -D OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP;
      `);
  } catch (error) {
    throw new Error(`Failed to kill connection to ${hostname}: ${error}`);
  }
}

// Sustained full outage toward the server: drop TCP:443 for `seconds` while
// repeatedly killing established sockets, then restore. A brief (1 s) cut like
// killConnection() lets the signaling websockets recover before the camera peers
// tear down; the webcam-background reproduction needs those peers to be destroyed
// and rebuilt, which requires an outage long enough to close their sockets. Like
// killConnection(), this needs workstation sudo and severs ALL local connections
// to the server, so specs using it must run standalone (--workers=1).
export async function severConnection(seconds = 5) {
  if (!hostname) {
    throw new Error('hostname is undefined; ensure BBB_URL is set');
  }
  if (!/^[a-zA-Z0-9.-]+$/.test(hostname)) {
    throw new Error(`Invalid hostname format: ${hostname}`);
  }
  if (!Number.isInteger(seconds) || seconds < 1 || seconds > 60) {
    throw new Error(`severConnection: seconds must be an integer in 1..60, got ${seconds}`);
  }

  try {
    await exec(`sudo iptables -A OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP`);
    for (let i = 0; i < seconds; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await exec(`sudo ss -K dst ${hostname} dport https || true; sleep 1`);
    }
  } finally {
    await exec(`sudo iptables -D OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP`);
  }
}
