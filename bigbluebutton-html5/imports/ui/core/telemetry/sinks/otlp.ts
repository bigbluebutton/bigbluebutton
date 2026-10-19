import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';
import { getConfig } from '../config';
import { BUCKET_BOUNDS, seriesSnapshot, totalCount } from '../store';
import { SeriesAttributes, SeriesSnapshot } from '../types';

// OTLP/HTTP JSON without the OpenTelemetry SDK: the store already aggregates, so this only
// serializes. Measured at ~1 KB gzip against ~20 KB for @opentelemetry/sdk-metrics.
// The html5 build ships a single bundle (LimitChunkCountPlugin, maxChunks: 1), so every session
// downloads this file even though only exporter "otlp" starts it. Keep it dependency-free.
// Protocol: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding

const AGGREGATION_TEMPORALITY_CUMULATIVE = 2;
// fetch keepalive bodies are capped at 64 KiB in flight
const KEEPALIVE_MAX_BYTES = 60_000;

const sessionStart = Date.now();

// int64 fields go as strings: epoch nanoseconds do not fit in a JS number
const toUnixNano = (ms: number): string => `${Math.round(ms)}000000`;

// String() on purpose: settings typed as string can arrive as numbers from YAML (html5ClientBuild: 216),
// and OTLP receivers reject a number in stringValue
const toKeyValues = (attributes: SeriesAttributes) => Object.keys(attributes).map((key) => ({
  key,
  value: { stringValue: String(attributes[key]) },
}));

const resourceAttributes = (): SeriesAttributes => {
  const settings = window.meetingClientSettings?.public?.app;
  return {
    'service.name': 'bbb-html5-client',
    'service.namespace': 'bigbluebutton',
    'service.version': String(settings?.html5ClientBuild ?? 'unknown'),
    // Random per-tab id created by settings-loader; not the session token
    'session.id': sessionStorage.getItem('clientSessionUUID') ?? 'unknown',
    'browser.mobile': String(deviceInfo.isMobile),
    'user_agent.original': navigator.userAgent,
  };
};

const toDataPoint = (item: SeriesSnapshot, now: number) => ({
  attributes: toKeyValues(item.attributes),
  startTimeUnixNano: toUnixNano(sessionStart),
  timeUnixNano: toUnixNano(now),
  count: String(item.count),
  sum: item.sum,
  min: item.min,
  max: item.max,
  bucketCounts: item.bucketCounts.map(String),
  explicitBounds: BUCKET_BOUNDS,
});

export const buildMetricsPayload = (snapshot: SeriesSnapshot[], now: number) => {
  const byMetric = new Map<string, SeriesSnapshot[]>();
  snapshot.forEach((item) => {
    byMetric.set(item.metric, [...(byMetric.get(item.metric) ?? []), item]);
  });

  return {
    resourceMetrics: [{
      resource: { attributes: toKeyValues(resourceAttributes()) },
      scopeMetrics: [{
        scope: { name: 'bbb-html5-client' },
        metrics: Array.from(byMetric.entries()).map(([name, items]) => ({
          name,
          unit: 'ms',
          histogram: {
            aggregationTemporality: AGGREGATION_TEMPORALITY_CUMULATIVE,
            dataPoints: items.map((item) => toDataPoint(item, now)),
          },
        })),
      }],
    }],
  };
};

const post = (path: string, body: string): void => {
  const url = `${getConfig().otlpUrl.replace(/\/$/, '')}${path}`;
  // The /api/telemetry location authorizes with the same check as /graphql: the x-session-token
  // header plus the bbb-web session cookie. sendBeacon cannot set headers, so keepalive fetch it is.
  fetch(url, {
    method: 'POST',
    body,
    credentials: 'include',
    keepalive: body.length < KEEPALIVE_MAX_BYTES,
    headers: {
      'Content-Type': 'application/json',
      'x-session-token': (Auth.sessionToken as string | null) ?? '',
    },
  }).catch(() => {
    // Telemetry must never surface errors to the user; the next flush retries with cumulative data
  });
};

const startOtlpSink = (): void => {
  let lastSentCount = 0;

  const flush = () => {
    const count = totalCount();
    if (count === lastSentCount) return;
    lastSentCount = count;
    post('/v1/metrics', JSON.stringify(buildMetricsPayload(seriesSnapshot(), Date.now())));
  };

  window.setInterval(flush, getConfig().flushIntervalMs);
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
};

export default startOtlpSink;
