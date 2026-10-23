import { exec as childExec } from 'node:child_process';
import process from 'node:process';
import * as util from 'node:util';

import { type Page as PlaywrightPage, test, type WebSocketRoute } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
import { routeLiveKitSignal } from '../core/livekit';
import { type ClientSettingsOverrides } from '../core/page';
import { parameters } from '../core/parameters';
import { runScript } from '../core/util';

const { hostname } = parameters;

const exec = util.promisify(childExec);

// the client waits 10 s before it reconnects the graphql websocket
export const RECONNECTION_TIME = 2 * ELEMENT_WAIT_EXTRA_LONG_TIME;

// code 3001 (disconnected, reconnecting) is left out of the default showConnectionErrors
export const SHOW_RECONNECTING_TOAST: ClientSettingsOverrides = {
  public: { app: { showConnectionErrors: [3001] } },
};

export interface GraphqlSockets {
  // how many graphql websockets the page has opened so far
  opened: () => number;
  // closes the open ones, as a lost connection would, and returns how many were open;
  // the client then reconnects
  drop: () => number;
  // whether the server has sent a message containing `text` since the last drop
  receivedSinceDrop: (text: string) => boolean;
}

// Proxies the page's graphql websocket so a spec can drop it, without root, and tell
// what the server sends on the connection that replaces it. Only messages containing
// one of `watchedTexts` are tracked. Call it before the page joins the meeting.
export async function routeGraphqlSockets(page: PlaywrightPage, watchedTexts: string[]): Promise<GraphqlSockets> {
  const open = new Set<{ page: WebSocketRoute; server: WebSocketRoute }>();
  const receivedSinceDrop = new Set<string>();
  let opened = 0;

  await page.routeWebSocket(/\/graphql$/, (pageSide) => {
    const serverSide = pageSide.connectToServer();
    const socket = { page: pageSide, server: serverSide };
    open.add(socket);
    opened += 1;
    pageSide.onMessage((message) => serverSide.send(message));
    serverSide.onMessage((message) => {
      if (typeof message === 'string') {
        watchedTexts.filter((text) => message.includes(text)).forEach((text) => receivedSinceDrop.add(text));
      }
      pageSide.send(message);
    });
    pageSide.onClose(() => {
      open.delete(socket);
      serverSide.close();
    });
  });

  return {
    opened: () => opened,
    drop: () => {
      const dropped = open.size;
      receivedSinceDrop.clear();
      open.forEach((socket) => {
        socket.page.close({ code: 1001, reason: 'connection dropped by the test' });
        socket.server.close();
      });
      open.clear();
      return dropped;
    },
    receivedSinceDrop: (text: string) => receivedSinceDrop.has(text),
  };
}

export interface ServerConnection {
  // closes the page's graphql and LiveKit signal sockets, as a network drop would, and
  // returns how many of each were open; the client reconnects on new ones
  drop: () => { graphql: number; liveKitSignal: number };
}

// Cuts the page's connection to the server from inside the browser: no root needed, and
// other pages and workers keep theirs. Call it before the page joins the meeting.
export async function routeServerConnection(page: PlaywrightPage): Promise<ServerConnection> {
  const graphqlSockets = await routeGraphqlSockets(page, []);
  const liveKitSignal = await routeLiveKitSignal(page);

  return {
    drop: () => ({ graphql: graphqlSockets.drop(), liveKitSignal: liveKitSignal.drop() }),
  };
}

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

// skip rather than fail: the outage tests drop packets with iptables and kill TCP
// sessions, which needs passwordless sudo - a machine-setup precondition, not a product
// defect (grant it beforehand by running "sudo -v" and entering the password)
export async function checkRootPermission(): Promise<void> {
  const checkSudo = await runScript('timeout -k 1 1 sudo id', {
    handleError: () => false,
    handleOutput: (stdout: string) => !!stdout,
    timeout: 5000,
  });
  test.skip(!checkSudo, 'Test requires root permission: run "sudo -v" first or grant passwordless sudo');
}

interface OutageOptions {
  media?: boolean;
  duringOutage?: () => Promise<void>;
}

type CommandRunner = (command: string) => Promise<unknown>;

interface OutageDependencies {
  runCommand?: CommandRunner;
  getSessions?: typeof getCurrentTCPSessions;
  killSessions?: typeof killTCPSessions;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

class OutageError extends Error {
  primaryError?: Error;

  cleanupErrors: Error[];

  constructor(message: string, primaryError?: Error, cleanupErrors: Error[] = []) {
    super(message);
    this.primaryError = primaryError;
    this.cleanupErrors = cleanupErrors;
  }
}

export async function outage(
  seconds: number,
  { media = false, duringOutage }: OutageOptions = {},
  { runCommand = exec, getSessions = getCurrentTCPSessions, killSessions = killTCPSessions }: OutageDependencies = {},
) {
  if (!hostname) throw new Error('hostname is undefined; ensure BBB_URL is set');
  if (!/^[a-zA-Z0-9.-]+$/.test(hostname)) throw new Error(`Invalid hostname format: ${hostname}`);
  if (!Number.isFinite(seconds) || seconds <= 0) throw new Error(`Invalid outage duration: ${seconds}`);

  const rules = [
    `sudo iptables -I OUTPUT -p tcp -d ${hostname} --dport 443 -j DROP`,
    ...(media ? [`sudo iptables -I OUTPUT -p udp -d ${hostname} --dport 16384:32768 -j DROP`] : []),
  ];
  const insertedRules: string[] = [];
  let primaryError: Error | undefined;
  try {
    for (const rule of rules) {
      await runCommand(rule);
      insertedRules.push(rule);
    }
    await killSessions(await getSessions());
    await Promise.all([
      new Promise((resolve) => {
        setTimeout(resolve, seconds * 1000);
      }),
      duringOutage?.(),
    ]);
  } catch (error) {
    primaryError = new OutageError(`Failed to simulate a ${seconds}s connection outage: ${errorMessage(error)}`);
  }
  const cleanupErrors: Error[] = [];
  for (const insertionRule of insertedRules.reverse()) {
    const removalRule = insertionRule.replace('iptables -I OUTPUT', 'iptables -D OUTPUT');
    try {
      await runCommand(removalRule);
    } catch (error) {
      cleanupErrors.push(
        new Error(`Failed to remove packet-filter rule with command "${removalRule}": ${errorMessage(error)}`),
      );
    }
  }
  if (cleanupErrors.length > 0) {
    const cleanupDetails = cleanupErrors.map((error) => error.message).join('; ');
    if (primaryError) {
      throw new OutageError(
        `${primaryError.message}; cleanup also failed: ${cleanupDetails}`,
        primaryError,
        cleanupErrors,
      );
    }
    throw new OutageError(
      `One or more packet-filter cleanup commands failed: ${cleanupDetails}`,
      undefined,
      cleanupErrors,
    );
  }
  if (primaryError) throw primaryError;
}
