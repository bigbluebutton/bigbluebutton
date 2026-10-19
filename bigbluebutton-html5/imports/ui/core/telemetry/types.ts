export type TelemetryKind = 'render' | 'request' | 'graphql' | 'longtask' | 'interaction';

export const TELEMETRY_KINDS: TelemetryKind[] = ['render', 'request', 'graphql', 'longtask', 'interaction'];

interface BaseEntry {
  // Wall-clock time (ms since epoch) when the measured work started
  ts: number;
  duration: number;
}

export interface RenderEntry extends BaseEntry {
  kind: 'render';
  id: string;
  phase: 'mount' | 'update' | 'nested-update';
  baseDuration: number;
}

export interface RequestEntry extends BaseEntry {
  kind: 'request';
  // Scrubbed: no query string, long ids replaced by :id
  path: string;
  initiatorType: string;
  // nextHopProtocol as reported by the browser: h2, http/1.1, h3, or '' when unknown
  protocol: string;
  ttfb: number;
  stall: number;
  transferSize: number;
  encodedBodySize: number;
}

export type GraphqlOperationType = 'query' | 'mutation' | 'subscription' | 'websocket';
export type GraphqlPhase = 'round-trip' | 'first-data' | 'connect' | 'reconnect';

export interface GraphqlEntry extends BaseEntry {
  kind: 'graphql';
  operationName: string;
  operationType: GraphqlOperationType;
  phase: GraphqlPhase;
  failed: boolean;
}

export interface LongTaskEntry extends BaseEntry {
  kind: 'longtask';
  // Attribution reported by the browser: self, same-origin, cross-origin-*, unknown
  name: string;
}

export interface InteractionEntry extends BaseEntry {
  kind: 'interaction';
  eventType: string;
  // data-test of the closest annotated ancestor; identifies the control, never its content
  dataTest: string;
}

export type TelemetryEntry = RenderEntry | RequestEntry | GraphqlEntry | LongTaskEntry | InteractionEntry;

export interface KindStats {
  count: number;
  p50: number;
  p95: number;
  max: number;
}

export type SeriesAttributes = Record<string, string>;

// Cumulative histogram of one metric + attribute set, ready to export
export interface SeriesSnapshot {
  metric: string;
  attributes: SeriesAttributes;
  count: number;
  sum: number;
  min: number;
  max: number;
  bucketCounts: number[];
}
