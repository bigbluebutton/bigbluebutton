export type TelemetryKind = 'render' | 'request' | 'graphql' | 'longtask' | 'interaction' | 'plugin';

export const TELEMETRY_KINDS: TelemetryKind[] = ['render', 'request', 'graphql', 'longtask', 'interaction', 'plugin'];

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
  // Plugin that sent the operation, or PLUGIN_UNKNOWN when only the plugin origin is known
  plugin?: string;
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

// load: script inserted -> onload. ready: -> first non-empty extensible area items.
// panel: content function called -> first DOM content. script: plugin script time in a long
// animation frame. data-channel: push -> the entry back in the data channel subscription.
// measure: a duration the plugin measured itself through pluginApi.telemetry.
export type PluginPhase = 'load' | 'ready' | 'panel' | 'script' | 'data-channel' | 'measure';

export interface PluginEntry extends BaseEntry {
  kind: 'plugin';
  plugin: string;
  phase: PluginPhase;
  failed: boolean;
  // Name the plugin gave a 'measure' entry (validated, bounded per plugin)
  name?: string;
}

export type TelemetryEntry = RenderEntry | RequestEntry | GraphqlEntry | LongTaskEntry | InteractionEntry | PluginEntry;

export interface KindStats {
  count: number;
  p50: number;
  p95: number;
  max: number;
}

export type SeriesAttributes = Record<string, string>;

// Last value of a quantity that is not a duration (e.g. the WebRTC quality score)
export interface GaugeSnapshot {
  metric: string;
  unit: string;
  attributes: SeriesAttributes;
  value: number;
  ts: number;
}

// Monotonic count of events that have no duration (errors, activations, entries received)
export interface CounterSnapshot {
  metric: string;
  attributes: SeriesAttributes;
  value: number;
  // Wall-clock ms when the first event was counted
  createdAt: number;
}

// Cumulative histogram of one metric + attribute set, ready to export
export interface SeriesSnapshot {
  metric: string;
  attributes: SeriesAttributes;
  count: number;
  sum: number;
  min: number;
  max: number;
  bucketCounts: number[];
  // Wall-clock ms when the first measurement arrived
  createdAt: number;
}
