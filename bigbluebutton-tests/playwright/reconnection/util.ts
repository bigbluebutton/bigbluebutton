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

export async function killMediaConnection(seconds = 3) {
  if (!hostname) throw new Error('hostname is undefined; ensure BBB_URL is set');
  if (!/^[a-zA-Z0-9.-]+$/.test(hostname)) throw new Error(`Invalid hostname format: ${hostname}`);

  const rules = [
    `sudo iptables -I OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP`,
    `sudo iptables -I OUTPUT -p udp -d ${hostname} --dport 16384:32768 -j DROP`,
  ];
  const insertedRules: string[] = [];
  try {
    for (const rule of rules) {
      await exec(rule);
      insertedRules.push(rule);
    }
    await exec(`sudo ss -K dst ${hostname} dport https`);
    await new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
  } finally {
    for (const rule of insertedRules.reverse()) {
      await exec(rule.replace('iptables -I OUTPUT', 'iptables -D OUTPUT'));
    }
  }
}
