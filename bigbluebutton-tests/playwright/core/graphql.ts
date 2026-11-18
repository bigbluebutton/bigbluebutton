import { expect } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from './constants';
import { Page } from './page';

// Sends GraphQL operations the way the client does, over a separate graphql-transport-ws
// connection authenticated with the page's own session, so a test can read the server state
// a participant sees or send the mutation a hidden control would have sent.

export interface GraphqlRequest {
  query: string;
  variables?: Record<string, unknown>;
}

export interface GraphqlResult {
  data?: Record<string, unknown> | null;
  errors?: unknown;
  // the server closed the connection before answering (e.g. it ejected the user)
  closed?: boolean;
}

// Runs in the browser. Sends one operation over a separate graphql-transport-ws
// connection authenticated with the page's own session, as the client does, and
// resolves with the first result (for a subscription: the current rows).
function browserGraphqlRequest({ query, variables = {} }: GraphqlRequest): Promise<GraphqlResult> {
  return new Promise<GraphqlResult>((resolve, reject) => {
    const sessionToken = sessionStorage.getItem('sessionToken');
    const clientSessionUUID = sessionStorage.getItem('clientSessionUUID');
    if (!sessionToken || !clientSessionUUID) {
      reject(new Error('no session in sessionStorage'));
      return;
    }
    const ws = new WebSocket(`wss://${window.location.host}/graphql`, 'graphql-transport-ws');
    const send = (message: unknown) => ws.send(JSON.stringify(message));
    const timer = setTimeout(() => {
      ws.close();
      reject(new Error('GraphQL request timed out'));
    }, 15000);
    const finish = (result: GraphqlResult) => {
      clearTimeout(timer);
      ws.onclose = null;
      ws.close();
      resolve(result);
    };
    ws.onerror = () => {
      clearTimeout(timer);
      reject(new Error('websocket error'));
    };
    ws.onclose = () => finish({ closed: true });
    ws.onopen = () =>
      send({
        type: 'connection_init',
        payload: {
          headers: {
            'X-Session-Token': sessionToken,
            'X-ClientSessionUUID': clientSessionUUID,
            'X-ClientType': 'HTML5',
            'X-ClientIsMobile': 'false',
          },
        },
      });
    ws.onmessage = (event: MessageEvent) => {
      const message = JSON.parse(event.data as string);
      if (message.type === 'ping') send({ type: 'pong' });
      else if (message.type === 'connection_ack') send({ id: '1', type: 'subscribe', payload: { query, variables } });
      else if (message.id === '1' && message.type === 'next') finish(message.payload);
      else if (message.id === '1' && message.type === 'error') finish({ errors: message.payload });
    };
  });
}

export function graphql(page: Page, query: string, variables?: Record<string, unknown>): Promise<GraphqlResult> {
  return page.page.evaluate(browserGraphqlRequest, { query, variables });
}

export async function readRows<T>(page: Page, query: string, view: string): Promise<T[]> {
  const { data, errors } = await graphql(page, query);
  expect(errors, `reading ${view} should not fail`).toBeUndefined();
  return (data?.[view] ?? []) as T[];
}

const CURRENT_USER = 'subscription { user_current { userId raiseHand } }';
const RAISE_HAND =
  'mutation RaiseHand($userId: String!, $raiseHand: Boolean!) { userSetRaiseHand(userId: $userId, raiseHand: $raiseHand) }';

export async function getOwnUserId(page: Page): Promise<string> {
  const [user] = await readRows<{ userId: string }>(page, CURRENT_USER, 'user_current');
  return user.userId;
}

// Sends a mutation the way the client does and checks that the GraphQL layer
// passed it on. A request the server punishes with an eject (apps.ejectOnViolation)
// can close the connection before the answer arrives.
export async function sendMutation(page: Page, query: string, field: string, variables?: Record<string, unknown>) {
  const result = await graphql(page, query, variables);
  expect(result.errors, `${field} should not be refused by the GraphQL layer`).toBeUndefined();
  if (!result.closed) expect(result.data?.[field], `${field} should be accepted`).toBe(true);
}

// Sends a request the server accepts (toggling the observer's raised hand) and
// waits until the observer sees it applied. akka-apps handles a meeting's
// messages in order, so by then it has also handled every request sent before.
export async function waitForServerToCatchUp(observer: Page) {
  const [{ userId, raiseHand }] = await readRows<{ userId: string; raiseHand: boolean }>(
    observer,
    CURRENT_USER,
    'user_current',
  );
  await sendMutation(observer, RAISE_HAND, 'userSetRaiseHand', { userId, raiseHand: !raiseHand });
  await expect
    .poll(async () => (await readRows<{ raiseHand: boolean }>(observer, CURRENT_USER, 'user_current'))[0]?.raiseHand, {
      timeout: ELEMENT_WAIT_LONGER_TIME,
      message: 'the server should apply the observer request',
    })
    .toBe(!raiseHand);
}
