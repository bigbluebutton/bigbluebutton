import { Telemetry } from '/imports/ui/Types/meetingClientSettings';
import meetingClientSettingsInitialValues from '/imports/ui/core/initial-values/meetingClientSettings';
import { TelemetryKind } from './types';

const FALLBACK: Telemetry = meetingClientSettingsInitialValues.public.app.telemetry;

let current: Telemetry = FALLBACK;
let active = false;

// Reads the settings once, after settings-loader filled window.meetingClientSettings.
// Older packaged settings.yml files have no telemetry block, so every key falls back.
export const loadConfig = (): Telemetry => {
  const fromServer = window.meetingClientSettings?.public?.app?.telemetry as Partial<Telemetry> | undefined;
  current = {
    ...FALLBACK,
    ...fromServer,
    thresholds: { ...FALLBACK.thresholds, ...fromServer?.thresholds },
    webrtcMonitor: { ...FALLBACK.webrtcMonitor, ...fromServer?.webrtcMonitor },
  };
  // Sampling is decided once per session so a session is either fully measured or not at all
  active = current.enabled && Math.random() < current.sampleRate;
  return current;
};

export const getConfig = (): Telemetry => current;

export const isTelemetryActive = (): boolean => active;

export const slowThreshold = (kind: TelemetryKind): number => {
  const { thresholds } = current;
  switch (kind) {
    case 'render': return thresholds.slowRenderMs;
    case 'request': return thresholds.slowRequestMs;
    case 'graphql': return thresholds.slowGraphqlMs;
    case 'longtask': return thresholds.longTaskMs;
    case 'interaction': return thresholds.slowInteractionMs;
    default: return Infinity;
  }
};
