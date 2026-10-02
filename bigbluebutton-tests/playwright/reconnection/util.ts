import { exec as childExec } from 'node:child_process';
import * as util from 'node:util';

import { type Page as PlaywrightPage, type WebSocketRoute } from '@playwright/test';

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
