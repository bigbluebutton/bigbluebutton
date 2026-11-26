import logger from '/imports/startup/client/logger';
import { Telemetry } from '/imports/ui/Types/meetingClientSettings';
import {
  clearActionTrail,
  ReproTrail,
  reproTrail,
  startActionTrail,
} from './actionTrail';
import { getConfig, isTelemetryActive, loadConfig } from './config';
import { startIncidentTriggers } from './incident';
import startSummaryEmitter from './emit';
import startMainThreadObservers from './observers/mainThreadObserver';
import startResourceObserver from './observers/resourceObserver';
import startWebrtcMonitor, { webrtcQuality, WebrtcQuality } from './webrtcMonitor';
import { startPluginErrorCounter, startPluginOperationAttribution } from './plugins';
import {
  clearStore,
  configureStore,
  counterSnapshot,
  kindStats,
  seriesSnapshot,
  topSlowest,
} from './store';
import {
  CounterSnapshot,
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
  counters: CounterSnapshot[];
  webrtc: WebrtcQuality;
}

const byKind = <T>(read: (kind: TelemetryKind) => T): Record<TelemetryKind, T> => ({
  render: read('render'),
  request: read('request'),
  graphql: read('graphql'),
  longtask: read('longtask'),
  interaction: read('interaction'),
  plugin: read('plugin'),
});

export const telemetryDump = (): TelemetryDump => ({
  enabled: isTelemetryActive(),
  config: getConfig(),
  stats: byKind(kindStats),
  slowest: byKind((kind) => topSlowest(kind, SLOWEST_PER_KIND)),
  series: seriesSnapshot(),
  counters: counterSnapshot(),
  webrtc: webrtcQuality(),
});

declare global {
  interface Window {
    bbbTelemetry?: {
      dump: () => TelemetryDump;
      stats: () => Record<TelemetryKind, KindStats>;
      trail: () => ReproTrail;
      clear: () => void;
    };
  }
}

let started = false;

// Discards the debug window's slow entries and the repro trail; exported totals keep counting
export const clearTelemetry = (): void => {
  clearStore();
  clearActionTrail();
};

// Called once by settings-loader, right after window.meetingClientSettings is filled
export const startTelemetry = (): void => {
  if (started) return;
  started = true;

  const config = loadConfig();
  if (!isTelemetryActive()) return;

  // Only with telemetry on: any script on the page, plugins included, can read this global
  window.bbbTelemetry = {
    dump: telemetryDump,
    stats: () => byKind(kindStats),
    trail: reproTrail,
    clear: clearTelemetry,
  };
  configureStore(config.bufferSize);
  startResourceObserver();
  startMainThreadObservers();
  startActionTrail();
  startIncidentTriggers();
  startWebrtcMonitor();
  startPluginErrorCounter();
  startPluginOperationAttribution();
  if (config.logToServer) startSummaryEmitter();
  if (config.exporter === 'otlp') {
    // import() keeps the sink out of the startup path: its own chunk, except in the single-bundle
    // Safari build, which inlines it
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

export { isTelemetryActive, reproTrail };
