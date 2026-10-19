import logger from '/imports/startup/client/logger';
import { reproTrail } from './actionTrail';
import { getConfig, isTelemetryActive } from './config';

// When something breaks, send the repro trail, so a production bug arrives with the steps that led
// to it. Two opt-ins: telemetry.enabled and telemetry.logToServer. It goes through the client log and,
// with exporter "otlp", also as an OTLP log record.

export type IncidentTrigger = 'react_error' | 'graphql_error' | 'network_error' | 'uncaught_error' | 'unhandled_rejection';

// One error tends to cascade into many; one trail per minute is enough to reproduce it
const MIN_INTERVAL_MS = 60_000;
const MAX_PER_SESSION = 5;
const MAX_MESSAGE_LENGTH = 200;

let sent = 0;
let lastSentAt = 0;

export interface IncidentError {
  errorName: string;
  errorMessage: string;
}

const describeError = (error: unknown): IncidentError => {
  if (error instanceof Error) {
    return { errorName: error.name, errorMessage: error.message.slice(0, MAX_MESSAGE_LENGTH) };
  }
  return { errorName: typeof error, errorMessage: String(error).slice(0, MAX_MESSAGE_LENGTH) };
};

export const reportIncident = (trigger: IncidentTrigger, error?: unknown): void => {
  if (!isTelemetryActive() || !getConfig().logToServer) return;
  const now = Date.now();
  if (sent >= MAX_PER_SESSION || now - lastSentAt < MIN_INTERVAL_MS) return;
  sent += 1;
  lastSentAt = now;

  const errorInfo = describeError(error);
  const trail = reproTrail();
  logger.warn({
    logCode: 'repro_trail',
    extraInfo: { trigger, ...errorInfo, trail },
  }, `Client repro trail after ${trigger}`);

  if (getConfig().exporter === 'otlp') {
    import('./sinks/otlp')
      .then(({ sendIncidentLog }) => sendIncidentLog(trigger, errorInfo, trail))
      .catch(() => {
        // The log record above already carries the trail
      });
  }
};

export const startIncidentTriggers = (): void => {
  if (!getConfig().logToServer) return;
  // Without capture, only runtime errors reach window; resource load errors do not bubble
  window.addEventListener('error', (event) => reportIncident('uncaught_error', event.error ?? event.message));
  window.addEventListener('unhandledrejection', (event) => reportIncident('unhandled_rejection', event.reason));
};
