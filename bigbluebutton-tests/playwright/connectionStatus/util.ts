import { expect, type Page as PlaywrightPage } from '@playwright/test';

import { elements as e } from '../core/elements';
import { Page } from '../core/page';

export interface HeartbeatFrames {
  sent: number;
  acknowledged: number;
}

// Counts the connection-alive heartbeats on the page's GraphQL websocket: the userSetConnectionAlive
// mutations the client sends and the server's answers. Attach it before the page joins, the websocket
// opens during the join. Reading user_connectionStatus from the test would not do: a read opens one more
// GraphQL connection for the same client session, and bbb-apps-akka resets the session's row
// (connectionAliveAt included) for every connection it sees.
export function watchHeartbeatFrames(page: PlaywrightPage): HeartbeatFrames {
  const frames: HeartbeatFrames = { sent: 0, acknowledged: 0 };
  page.on('websocket', (ws) => {
    ws.on('framesent', ({ payload }) => {
      if (typeof payload === 'string' && payload.includes('userSetConnectionAlive(')) frames.sent += 1;
    });
    ws.on('framereceived', ({ payload }) => {
      if (typeof payload === 'string' && payload.includes('"userSetConnectionAlive":true')) frames.acknowledged += 1;
    });
  });
  return frames;
}

// Two accepted heartbeats: the first one and the one an interval later.
export async function expectHeartbeatsAccepted(heartbeats: HeartbeatFrames, timeout: number) {
  await expect
    .poll(() => heartbeats.acknowledged, {
      message: 'should send connection-alive heartbeats that the server accepts',
      timeout,
    })
    .toBeGreaterThanOrEqual(2);
}

export async function openConnectionStatus(testPage: Page) {
  await testPage.waitAndClick(e.connectionStatusBtn);
  await testPage.waitForSelector(e.connectionStatusModal);
}

export async function checkNetworkStatus(dataContainer: string): Promise<boolean> {
  const values = Array.from(document.querySelectorAll(`${dataContainer} > div`));
  values.splice(4, values.length - 4);
  const check = values.filter((elem) => elem.textContent?.includes(' 0 k'))[0];

  return !check;
}
