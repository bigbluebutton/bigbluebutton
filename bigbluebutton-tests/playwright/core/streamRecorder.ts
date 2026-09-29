import type { BrowserContext, Page as PlaywrightPage, WebSocketRoute } from '@playwright/test';

/**
 * Records the GraphQL subscription frames bbb-graphql-middleware pushes to a browser.
 *
 * The four subscriptions below are answered by the middleware itself rather than forwarded to
 * Hasura (internal/websrv/reader short-circuits them), so they are governed by the middleware's
 * own per-send checks.
 *
 * These tests work at the frame level because the streams have no UI surface once a user is no
 * longer in the meeting: the client has unmounted the components that consume them, while the
 * socket itself stays open (ConnectionManager sits above PresenceManager in client/main.tsx).
 * What the server sends on that socket is therefore observable only as frames.
 *
 * Modelled on the routeWebSocket proxy in chat/privateChatListPreview.ts.
 */

export const MIDDLEWARE_STREAMS = {
  chat: { rootField: 'chat_message_stream', operationName: 'getChatMessageStream' },
  cursor: { rootField: 'pres_page_cursor_stream', operationName: 'getCursorCoordinatesStream' },
  notification: { rootField: 'notification_stream', operationName: 'getNotificationStream' },
  voice: { rootField: 'user_voice_activity_stream', operationName: 'getUserVoiceStateStream' },
} as const;

export type StreamName = keyof typeof MIDDLEWARE_STREAMS;

export const ALL_STREAMS = Object.keys(MIDDLEWARE_STREAMS) as StreamName[];

const STREAM_BY_OPERATION = new Map<string, StreamName>(
  ALL_STREAMS.map((s) => [MIDDLEWARE_STREAMS[s].operationName, s]),
);

/** Detail frames are for failure messages only; assertions use the exact counters. */
const MAX_DETAIL_FRAMES = 500;

export interface RecordedFrame {
  stream: StreamName;
  at: number;
  excerpt: string;
}

export type StreamCounts = Record<StreamName, number>;

/** Opaque snapshot of the exact per-stream totals at a point in time. */
export interface StreamMark {
  at: number;
  totals: StreamCounts;
}

export interface CloseEvent {
  at: number;
  side: 'browser' | 'server';
  code?: number;
  reason?: string;
}

export interface StreamRecorder {
  mark(): StreamMark;
  /** Exact frame counts per stream since `mark`. Never lossy. */
  countsSince(mark: StreamMark): StreamCounts;
  /** Best-effort detail for failure messages; capped at MAX_DETAIL_FRAMES. */
  framesSince(mark: StreamMark, stream?: StreamName): RecordedFrame[];
  streamsSince(mark: StreamMark): StreamName[];

  /**
   * True while at least one connection to the middleware is still open, which is what decides
   * whether the middleware could still deliver. A "no frames arrived" assertion means nothing if
   * that connection died, so tests MUST check this before concluding anything was withheld.
   */
  isSocketOpen(): boolean;
  /** More than one means the client reconnected, which re-registers subscriptions server-side. */
  totalSocketsOpened(): number;
  closeEvents(): CloseEvent[];

  /** Middleware operation names the client subscribed to. */
  subscribedOperations(): StreamName[];
  /** How many client `complete` frames were withheld. Proves the suppression path actually ran. */
  suppressedCompletes(): number;

  /**
   * Withhold the client's outgoing `complete` frames for the four middleware subscriptions.
   *
   * A client that unsubscribes stops receiving these streams for reasons that have nothing to do
   * with the per-send checks, so a run that lets `complete` through cannot attribute silence to
   * those checks and proves nothing either way.
   *
   * Withholding them keeps the subscriptions registered for the lifetime of the run, which is what
   * makes the resulting silence attributable.
   *
   * Do NOT "fix" a failing test by disabling this; it would make the test vacuous.
   */
  suppressClientComplete(on: boolean): void;

  /**
   * Keep the connection to the middleware open after the browser closes its end.
   *
   * graphql-ws closes the socket once its own subscription lock count reaches zero, which happens
   * a few seconds after the client unmounts its consumers. That leaves a short and unpredictable
   * window in which frames could be observed, and a run racing it is flaky.
   *
   * The proxy sits between the two, so it can let the browser go while holding the middleware
   * connection open and carrying on recording.
   */
  keepServerConnectionOpen(on: boolean): void;
}

function emptyCounts(): StreamCounts {
  return { chat: 0, cursor: 0, notification: 0, voice: 0 };
}

export async function recordStreamFrames(
  target: PlaywrightPage | BrowserContext,
  urlPattern: string | RegExp = /\/graphql/,
): Promise<StreamRecorder> {
  const totals = emptyCounts();
  const detail: RecordedFrame[] = [];
  const closes: CloseEvent[] = [];
  const openBrowserSockets = new Set<WebSocketRoute>();
  const openServerSockets = new Set<WebSocketRoute>();
  const subscribed = new Set<StreamName>();
  // Subscription ids the client used for the middleware-managed operations, learned from its own
  // outgoing `subscribe` frames.
  const middlewareQueryIds = new Set<string>();
  let socketsOpened = 0;
  let suppressing = false;
  let suppressed = 0;
  let keepServerOpen = false;

  await target.routeWebSocket(urlPattern, (ws) => {
    const server = ws.connectToServer();
    openBrowserSockets.add(ws);
    openServerSockets.add(server);
    socketsOpened += 1;

    // Browser -> server. Low volume, so parsing here is cheap.
    ws.onMessage((message) => {
      const asText = typeof message === 'string' ? message : '';

      if (asText.includes('"subscribe"') || asText.includes('"complete"')) {
        try {
          const parsed = JSON.parse(asText);
          const stream = STREAM_BY_OPERATION.get(parsed?.payload?.operationName);

          if (parsed?.type === 'subscribe' && stream) {
            subscribed.add(stream);
            middlewareQueryIds.add(String(parsed.id));
          }

          if (suppressing && parsed?.type === 'complete' && middlewareQueryIds.has(String(parsed.id))) {
            suppressed += 1;
            return; // withheld on purpose -- see suppressClientComplete
          }
        } catch {
          // Not JSON we recognise: forward it untouched.
        }
      }

      server.send(message);
    });

    // Server -> browser. High volume, so substring-match before parsing anything.
    server.onMessage((message) => {
      const asText = typeof message === 'string' ? message : '';

      for (const stream of ALL_STREAMS) {
        if (asText.includes(MIDDLEWARE_STREAMS[stream].rootField)) {
          totals[stream] += 1;
          if (detail.length < MAX_DETAIL_FRAMES) {
            detail.push({ stream, at: Date.now(), excerpt: asText.slice(0, 300) });
          }
          break;
        }
      }

      // The browser may already be gone while the middleware connection is deliberately held
      // open, in which case there is nobody to forward to and that is fine.
      try {
        ws.send(message);
      } catch {
        // browser side closed
      }
    });

    // Installing onClose disables Playwright's default close propagation, so forward it by hand.
    ws.onClose((code, reason) => {
      openBrowserSockets.delete(ws);
      closes.push({ at: Date.now(), side: 'browser', code, reason });
      if (keepServerOpen) return;
      try {
        server.close({ code, reason });
      } catch {
        server.close();
      }
    });

    server.onClose((code, reason) => {
      openServerSockets.delete(server);
      closes.push({ at: Date.now(), side: 'server', code, reason });
      try {
        ws.close({ code, reason });
      } catch {
        ws.close();
      }
    });
  });

  return {
    mark: () => ({ at: Date.now(), totals: { ...totals } }),
    countsSince: (mark) => {
      const since = emptyCounts();
      for (const stream of ALL_STREAMS) since[stream] = totals[stream] - mark.totals[stream];
      return since;
    },
    framesSince: (mark, stream) => detail.filter((f) => f.at >= mark.at && (!stream || f.stream === stream)),
    streamsSince: (mark) => ALL_STREAMS.filter((s) => totals[s] - mark.totals[s] > 0),
    isSocketOpen: () => openServerSockets.size > 0,
    totalSocketsOpened: () => socketsOpened,
    closeEvents: () => [...closes],
    subscribedOperations: () => [...subscribed],
    suppressedCompletes: () => suppressed,
    suppressClientComplete: (on: boolean) => {
      suppressing = on;
    },
    keepServerConnectionOpen: (on: boolean) => {
      keepServerOpen = on;
    },
  };
}
