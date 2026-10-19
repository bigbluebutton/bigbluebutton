import logger from '/imports/startup/client/logger';
import { getConfig } from './config';
import type { LogRecordInput } from './sinks/otlp';
import { kindStats, topSlowest } from './store';
import { TELEMETRY_KINDS, TelemetryEntry, TelemetryKind } from './types';

// Periodic summary through the existing client logger (clientLog.external) and, with exporter
// "otlp", as OTLP log records. Never raw entries. Volume per flush: at most one record per kind,
// and only for kinds that got new measurements.

const TOP_OFFENDERS = 5;

const summarize = (entry: TelemetryEntry) => ({ ...entry, duration: Math.round(entry.duration) });

// Short human-readable name of a slow entry, for the log body
const entryLabel = (entry: TelemetryEntry): string => {
  const ms = `${Math.round(entry.duration)} ms`;
  switch (entry.kind) {
    case 'render': return `${entry.id} ${entry.phase} ${ms}`;
    case 'request': return `${entry.path} ${entry.protocol || '?'} ${ms}`;
    case 'graphql': return `${entry.operationName} ${entry.phase} ${ms}`;
    case 'longtask': return `${entry.name} ${ms}`;
    case 'interaction': return `${entry.eventType} ${entry.dataTest || '?'} ${ms}`;
    default: return ms;
  }
};

const startSummaryEmitter = (): void => {
  const lastCount: Partial<Record<TelemetryKind, number>> = {};

  const flush = () => {
    const otlpSummaries: LogRecordInput[] = [];
    TELEMETRY_KINDS.forEach((kind) => {
      const stats = kindStats(kind);
      if (stats.count === 0 || stats.count === lastCount[kind]) return;
      lastCount[kind] = stats.count;
      const top = topSlowest(kind, TOP_OFFENDERS);
      logger.info({
        logCode: `perf_${kind}`,
        extraInfo: { ...stats, top: top.map(summarize) },
      }, `Client telemetry summary: ${kind}`);

      const slowest = top.map(entryLabel).join(' | ');
      otlpSummaries.push({
        severity: 'INFO',
        body: `${kind}: ${stats.count} measurements, p50 ${stats.p50} ms, p95 ${stats.p95} ms, max ${stats.max} ms`
          + `${slowest ? `. Slowest: ${slowest}` : ''}`,
        attributes: {
          'event.name': 'bbb.perf_summary',
          'bbb.kind': kind,
          'bbb.count': stats.count,
          'bbb.p50_ms': stats.p50,
          'bbb.p95_ms': stats.p95,
          'bbb.max_ms': stats.max,
          'bbb.slowest': slowest,
        },
      });
    });

    if (otlpSummaries.length && getConfig().exporter === 'otlp') {
      import('./sinks/otlp')
        .then(({ sendLogs }) => sendLogs(otlpSummaries))
        .catch(() => {
          // The client log records above already carry the same summary
        });
    }
  };

  window.setInterval(flush, getConfig().flushIntervalMs);
  // The external log stream already flushes on close (clientLog.external.flushOnClose)
  window.addEventListener('pagehide', flush);
};

export default startSummaryEmitter;
