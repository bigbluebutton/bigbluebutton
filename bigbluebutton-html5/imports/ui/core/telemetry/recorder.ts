import { isTelemetryActive, slowThreshold } from './config';
import { recordEntry } from './store';
import { TelemetryEntry } from './types';

// Single entry point for every measurement. A no-op until telemetry is active.
export const recordTelemetry = (entry: TelemetryEntry): void => {
  if (!isTelemetryActive()) return;
  recordEntry(entry, entry.duration >= slowThreshold(entry.kind));
};

// WebSocket (re)connection time, from graphql-ws "connecting" to "connected"
export const recordWebsocketConnect = (phase: 'connect' | 'reconnect', connectingSince: number): void => {
  if (!isTelemetryActive() || connectingSince <= 0) return;
  recordTelemetry({
    kind: 'graphql',
    ts: connectingSince,
    duration: Date.now() - connectingSince,
    operationName: '(websocket)',
    operationType: 'websocket',
    phase,
    failed: false,
  });
};

// performance.* timestamps are relative to the page's time origin
export const toEpochMs = (relative: number): number => Math.round(performance.timeOrigin + relative);
