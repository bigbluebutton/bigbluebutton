import logger from '/imports/startup/client/logger';
import { Telemetry } from '/imports/ui/Types/meetingClientSettings';
import { getConfig, isTelemetryActive, loadConfig } from './config';
import startSummaryEmitter from './emit';
import startMainThreadObservers from './observers/mainThreadObserver';
import startResourceObserver from './observers/resourceObserver';
import {
  clearStore,
  configureStore,
  kindStats,
  seriesSnapshot,
  topSlowest,
} from './store';
import {
  KindStats,
  SeriesSnapshot,
  TELEMETRY_KINDS,
  TelemetryEntry,
  TelemetryKind,
} from './types';

// Client performance telemetry, configured by public.app.telemetry in settings.yml

const SLOWEST_PER_KIND = 20;

export interface TelemetryDump {
  enabled: boolean;
  config: Telemetry;
  stats: Record<TelemetryKind, KindStats>;
  slowest: Record<TelemetryKind, TelemetryEntry[]>;
  series: SeriesSnapshot[];
}

const byKind = <T>(read: (kind: TelemetryKind) => T): Record<TelemetryKind, T> => ({
  render: read('render'),
  request: read('request'),
  graphql: read('graphql'),
  longtask: read('longtask'),
  interaction: read('interaction'),
});

export const telemetryDump = (): TelemetryDump => ({
  enabled: isTelemetryActive(),
  config: getConfig(),
  stats: byKind(kindStats),
  slowest: byKind((kind) => topSlowest(kind, SLOWEST_PER_KIND)),
  series: seriesSnapshot(),
});

declare global {
  interface Window {
    bbbTelemetry?: {
      dump: () => TelemetryDump;
      stats: () => Record<TelemetryKind, KindStats>;
      clear: () => void;
    };
  }
}

let started = false;

// Called once by settings-loader, right after window.meetingClientSettings is filled
export const startTelemetry = (): void => {
  if (started) return;
  started = true;

  const config = loadConfig();
  window.bbbTelemetry = {
    dump: telemetryDump,
    stats: () => byKind(kindStats),
    clear: clearStore,
  };
  if (!isTelemetryActive()) return;

  configureStore(config.bufferSize);
  startResourceObserver();
  startMainThreadObservers();
  if (config.logToServer) startSummaryEmitter();
  if (config.exporter === 'otlp') {
    // import() keeps the sink out of the startup path and becomes a real chunk if the build ever
    // allows more than one; today webpack inlines it (maxChunks: 1)
    import('./sinks/otlp')
      .then(({ default: startOtlpSink }) => startOtlpSink())
      .catch((error: Error) => {
        logger.warn({
          logCode: 'telemetry_sink_load_error',
          extraInfo: { errorMessage: error.message },
        }, 'Could not load the OTLP telemetry sink');
      });
  }

  logger.info({
    logCode: 'telemetry_started',
    extraInfo: {
      kinds: TELEMETRY_KINDS,
      exporter: config.exporter,
      logToServer: config.logToServer,
      sampleRate: config.sampleRate,
    },
  }, 'Client performance telemetry started');
};

export { isTelemetryActive, clearStore as clearTelemetry };
