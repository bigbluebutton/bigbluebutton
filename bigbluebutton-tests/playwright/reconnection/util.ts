import { exec as childExec } from 'node:child_process';
import * as util from 'node:util';

import { type Page as PlaywrightPage, type WebSocketRoute } from '@playwright/test';

import { getCurrentTCPSessions, killTCPSessions } from '../connectionFailure/util';
import { parameters } from '../core/parameters';

const { hostname } = parameters;

const exec = util.promisify(childExec);

export interface GraphqlSockets {
  // how many graphql websockets the page has opened so far
  opened: () => number;
  // closes the open ones, as a lost connection would; the client then reconnects
  drop: () => void;
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
      receivedSinceDrop.clear();
      open.forEach((socket) => {
        socket.page.close({ code: 1001, reason: 'connection dropped by the test' });
        socket.server.close();
      });
      open.clear();
    },
    receivedSinceDrop: (text: string) => receivedSinceDrop.has(text),
  };
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
