import * as util from 'node:util';
import { exec as childExec } from 'node:child_process';
import { parameters } from '../core/parameters';

const { hostname } = parameters;

const exec = util.promisify(childExec);

export async function killConnection() {
  await exec(`
    sudo ss -K dst ${hostname} dport https;
    sudo iptables -A OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP;
    sleep 1;
    sudo iptables -D OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP;
  `);
}
