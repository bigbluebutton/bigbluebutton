import logger from '/imports/startup/client/logger';
import { getConfig } from './config';
import { kindStats, topSlowest } from './store';
import { TELEMETRY_KINDS, TelemetryEntry, TelemetryKind } from './types';

// Periodic summary through the existing client logger (clientLog.external), never raw entries.
// Volume per flush: at most one line per kind, and only for kinds that got new measurements.

const TOP_OFFENDERS = 5;

const summarize = (entry: TelemetryEntry) => ({ ...entry, duration: Math.round(entry.duration) });

const startSummaryEmitter = (): void => {
  const lastCount: Partial<Record<TelemetryKind, number>> = {};

  const flush = () => {
    TELEMETRY_KINDS.forEach((kind) => {
      const stats = kindStats(kind);
      if (stats.count === 0 || stats.count === lastCount[kind]) return;
      lastCount[kind] = stats.count;
      logger.info({
        logCode: `perf_${kind}`,
        extraInfo: {
          ...stats,
          top: topSlowest(kind, TOP_OFFENDERS).map(summarize),
        },
      }, `Client telemetry summary: ${kind}`);
    });
  };

  window.setInterval(flush, getConfig().flushIntervalMs);
  // The external log stream already flushes on close (clientLog.external.flushOnClose)
  window.addEventListener('pagehide', flush);
};

export default startSummaryEmitter;
