import { getConfig } from '../config';
import { recordTelemetry, toEpochMs } from '../recorder';
import scrubUrl from '../scrub';

// Requests the telemetry sends itself; measuring them would feed the next send
const ownTrafficPrefixes = (): string[] => {
  const prefixes = [scrubUrl(getConfig().otlpUrl)];
  const externalLogUrl = window.meetingClientSettings?.public?.clientLog?.external?.url;
  if (externalLogUrl) prefixes.push(scrubUrl(externalLogUrl));
  return prefixes;
};

const startResourceObserver = (): void => {
  if (typeof PerformanceObserver === 'undefined') return;
  const supported = PerformanceObserver.supportedEntryTypes ?? [];
  const ignored = ownTrafficPrefixes();

  const observer = new PerformanceObserver((list) => {
    list.getEntries().forEach((item) => {
      const entry = item as PerformanceResourceTiming;
      const path = scrubUrl(entry.name);
      if (ignored.some((prefix) => path.startsWith(prefix))) return;

      recordTelemetry({
        kind: 'request',
        ts: toEpochMs(entry.startTime),
        duration: entry.duration,
        path,
        initiatorType: entry.initiatorType || 'other',
        // h2 vs http/1.1 per request; empty for cache hits and cross-origin without Timing-Allow-Origin
        protocol: entry.nextHopProtocol,
        ttfb: entry.responseStart > 0 ? entry.responseStart - entry.requestStart : 0,
        stall: entry.requestStart > 0 ? entry.requestStart - entry.startTime : 0,
        transferSize: entry.transferSize,
        encodedBodySize: entry.encodedBodySize,
      });
    });
  });

  // buffered: true replays what loaded before the observer existed (the initial page load).
  // The browser keeps only 250 resource entries for that replay; later ones always arrive.
  ['navigation', 'resource']
    .filter((type) => supported.includes(type))
    .forEach((type) => observer.observe({ type, buffered: true }));
};

export default startResourceObserver;
