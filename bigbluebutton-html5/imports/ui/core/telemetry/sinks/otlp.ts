import BBBWeb from '/imports/api/bbb-web-api';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import deviceInfo from '/imports/utils/deviceInfo';
import type { ReproTrail } from '../actionTrail';
import { getConfig } from '../config';
import type { IncidentError, IncidentTrigger } from '../incident';
import {
  BUCKET_BOUNDS,
  counterSnapshot,
  counterUpdateCount,
  gaugeSnapshot,
  gaugeUpdateCount,
  seriesSnapshot,
  totalCount,
} from '../store';
import {
  CounterSnapshot,
  GaugeSnapshot,
  SeriesAttributes,
  SeriesSnapshot,
} from '../types';

// OTLP/HTTP JSON without the OpenTelemetry SDK: the store already aggregates, so this only
// serializes. Measured at ~1 KB gzip against ~20 KB for @opentelemetry/sdk-metrics.
// index.ts loads it with import(), so it is its own chunk except in the single-bundle Safari build,
// where every session downloads it even though only exporter "otlp" starts it. Keep it dependency-free.
// Protocol: https://opentelemetry.io/docs/specs/otlp/#json-protobuf-encoding

const AGGREGATION_TEMPORALITY_CUMULATIVE = 2;
const SEVERITY = { INFO: 9, WARN: 13 } as const;
// fetch keepalive bodies are capped at 64 KiB in flight
const KEEPALIVE_MAX_BYTES = 60_000;
// Every flush sends only the series that changed since the previous one; the values are cumulative,
// so the backend keeps the last point of the others. Every Nth flush sends everything, so a series
// that stopped changing still shows up within a few minutes and a lost request heals itself.
const FULL_SNAPSHOT_EVERY = 10;

// Start of every cumulative series: the page load, before any measurement could exist
const sessionStart = Math.round(performance.timeOrigin);

// int64 fields go as strings: epoch nanoseconds do not fit in a JS number
const toUnixNano = (ms: number): string => `${Math.round(ms)}000000`;

// String() on purpose: settings typed as string can arrive as numbers from YAML (html5ClientBuild: 216),
// and OTLP receivers reject a number in stringValue
const toKeyValues = (attributes: SeriesAttributes) => Object.keys(attributes).map((key) => ({
  key,
  value: { stringValue: String(attributes[key]) },
}));

const sessionId = () => sessionStorage.getItem('clientSessionUUID') ?? 'unknown';

const resourceAttributes = (): SeriesAttributes => {
  const settings = window.meetingClientSettings?.public?.app;
  return {
    'service.name': 'bbb-html5-client',
    'service.namespace': 'bigbluebutton',
    'service.version': String(settings?.html5ClientBuild ?? 'unknown'),
    // Random per-tab id created by settings-loader; not the session token
    'session.id': sessionId(),
    // Each tab is its own producer of cumulative series. Without an instance, Prometheus-style
    // backends merge every session into one series and read their values as counter resets.
    'service.instance.id': sessionId(),
    'browser.mobile': String(deviceInfo.isMobile),
    'user_agent.original': navigator.userAgent,
  };
};

// A series sent for the first time also gets a zero point at its creation time. Backends compute
// increases between points, so without it the measurements of a series' first export are lost
// (and a series that is sent once, like a plugin load, never shows up at all).
// Two points of one series cannot share a timestamp
const zeroTime = (createdAt: number, now: number) => Math.min(createdAt, now - 1);

export interface Outgoing<T> {
  item: T;
  first: boolean;
}

const toDataPoints = ({ item, first }: Outgoing<SeriesSnapshot>, now: number) => {
  const point = (time: number, empty: boolean) => ({
    attributes: toKeyValues(item.attributes),
    startTimeUnixNano: toUnixNano(sessionStart),
    timeUnixNano: toUnixNano(time),
    count: empty ? '0' : String(item.count),
    sum: empty ? 0 : item.sum,
    ...(empty ? {} : { min: item.min, max: item.max }),
    bucketCounts: empty ? item.bucketCounts.map(() => '0') : item.bucketCounts.map(String),
    explicitBounds: BUCKET_BOUNDS,
  });
  return first ? [point(zeroTime(item.createdAt, now), true), point(now, false)] : [point(now, false)];
};

const toGaugeMetric = (item: GaugeSnapshot) => ({
  name: item.metric,
  unit: item.unit,
  gauge: {
    dataPoints: [{
      attributes: toKeyValues(item.attributes),
      timeUnixNano: toUnixNano(item.ts),
      asDouble: item.value,
    }],
  },
});

const groupByMetric = <T extends { metric: string }>(outgoing: Outgoing<T>[]) => {
  const byMetric = new Map<string, Outgoing<T>[]>();
  outgoing.forEach((entry) => {
    byMetric.set(entry.item.metric, [...(byMetric.get(entry.item.metric) ?? []), entry]);
  });
  return Array.from(byMetric.entries());
};

// Cumulative monotonic sums, grouped by metric like the histograms
const toCounterMetrics = (counters: Outgoing<CounterSnapshot>[], now: number) => (
  groupByMetric(counters).map(([name, entries]) => ({
    name,
    unit: '1',
    sum: {
      aggregationTemporality: AGGREGATION_TEMPORALITY_CUMULATIVE,
      isMonotonic: true,
      dataPoints: entries.flatMap(({ item, first }) => {
        const point = (time: number, value: number) => ({
          attributes: toKeyValues(item.attributes),
          startTimeUnixNano: toUnixNano(sessionStart),
          timeUnixNano: toUnixNano(time),
          asInt: String(value),
        });
        return first ? [point(zeroTime(item.createdAt, now), 0), point(now, item.value)] : [point(now, item.value)];
      }),
    },
  }))
);

export const buildMetricsPayload = (
  snapshot: Outgoing<SeriesSnapshot>[],
  now: number,
  gauges: GaugeSnapshot[] = [],
  counters: Outgoing<CounterSnapshot>[] = [],
) => ({
  resourceMetrics: [{
    resource: { attributes: toKeyValues(resourceAttributes()) },
    scopeMetrics: [{
      scope: { name: 'bbb-html5-client' },
      metrics: [
        ...groupByMetric(snapshot).map(([name, entries]) => ({
          name,
          unit: 'ms',
          histogram: {
            aggregationTemporality: AGGREGATION_TEMPORALITY_CUMULATIVE,
            dataPoints: entries.flatMap((entry) => toDataPoints(entry, now)),
          },
        })),
        ...gauges.map(toGaugeMetric),
        ...toCounterMetrics(counters, now),
      ],
    }],
  }],
});

// The session token only goes where the client already sends it: this page's origin and the GraphQL
// host (another host in cluster setups). An otlpUrl pointing anywhere else, such as a backend's own
// ingest URL, gets the data without the token or the cookies.
const trustedOrigins = new Set([window.location.origin]);
let warnedUntrusted = false;

const trustGraphqlOrigin = (): void => {
  BBBWeb.index().then(({ data }) => {
    if (!data.graphqlWebsocketUrl) return;
    const graphql = new URL(data.graphqlWebsocketUrl, window.location.href);
    graphql.protocol = graphql.protocol === 'ws:' ? 'http:' : 'https:';
    trustedOrigins.add(graphql.origin);
  }).catch(() => {
    // Without the index, only this page's origin is trusted
  });
};

const isTrusted = (url: URL): boolean => {
  if (trustedOrigins.has(url.origin)) return true;
  if (!warnedUntrusted) {
    warnedUntrusted = true;
    logger.warn({
      logCode: 'telemetry_untrusted_otlp_url',
      extraInfo: { otlpHost: url.host },
    }, 'Telemetry otlpUrl is not a BBB host; sending without the session token');
  }
  return false;
};

const post = (path: string, body: string): void => {
  const url = new URL(`${getConfig().otlpUrl.replace(/\/$/, '')}${path}`, window.location.href);
  // The /api/telemetry location authorizes with the same check as /graphql: the x-session-token
  // header plus the bbb-web session cookie. sendBeacon cannot set headers, so keepalive fetch it is.
  const trusted = isTrusted(url);
  fetch(url, {
    method: 'POST',
    body,
    credentials: trusted ? 'include' : 'omit',
    keepalive: body.length < KEEPALIVE_MAX_BYTES,
    headers: {
      'Content-Type': 'application/json',
      ...(trusted ? { 'x-session-token': (Auth.sessionToken as string | null) ?? '' } : {}),
    },
  }).catch(() => {
    // Telemetry must never surface errors to the user; the next flush retries with cumulative data
  });
};

export type LogAttributes = Record<string, string | number>;

// Numbers stay numbers in logs, so the backend can filter on them (e.g. bbb.p95_ms > 500)
const toLogKeyValues = (attributes: LogAttributes) => Object.keys(attributes).map((key) => {
  const value = attributes[key];
  return { key, value: typeof value === 'number' ? { doubleValue: value } : { stringValue: String(value) } };
});

export interface LogRecordInput {
  severity: keyof typeof SEVERITY;
  body: string;
  attributes: LogAttributes;
}

// OTLP log records, all in one request
export const sendLogs = (records: LogRecordInput[]): void => {
  if (!records.length) return;
  const now = toUnixNano(Date.now());
  const payload = {
    resourceLogs: [{
      resource: { attributes: toKeyValues(resourceAttributes()) },
      scopeLogs: [{
        scope: { name: 'bbb-html5-client' },
        logRecords: records.map(({ severity, body, attributes }) => ({
          timeUnixNano: now,
          observedTimeUnixNano: now,
          severityNumber: SEVERITY[severity],
          severityText: severity,
          body: { stringValue: body },
          attributes: toLogKeyValues(attributes),
        })),
      }],
    }],
  };
  post('/v1/logs', JSON.stringify(payload));
};

// The repro trail of an incident: exception.* attributes plus the trail as body
export const sendIncidentLog = (trigger: IncidentTrigger, error: IncidentError, trail: ReproTrail): void => {
  sendLogs([{
    severity: 'WARN',
    body: JSON.stringify(trail),
    attributes: {
      'event.name': 'bbb.repro_trail',
      'bbb.incident.trigger': trigger,
      // Only the type: messages can quote user content (JSON.parse quotes its input, for one)
      'exception.type': error.errorName,
      ...(error.plugin ? { 'bbb.plugin.name': error.plugin } : {}),
      'bbb.trail.actions': trail.actions.length,
    },
  }]);
};

const keyOf = (item: { metric: string; attributes: SeriesAttributes }) => (
  `${item.metric}|${JSON.stringify(item.attributes)}`
);

// Keeps, per series, the value that went out last, and drops the series that did not change
const changedOnly = <T extends { metric: string; attributes: SeriesAttributes }>(
  items: T[],
  sent: Map<string, number>,
  valueOf: (item: T) => number,
  full: boolean,
): Outgoing<T>[] => {
  const outgoing: Outgoing<T>[] = [];
  items.forEach((item) => {
    const key = keyOf(item);
    const value = valueOf(item);
    const first = !sent.has(key);
    if (!full && !first && sent.get(key) === value) return;
    sent.set(key, value);
    outgoing.push({ item, first });
  });
  return outgoing;
};

const startOtlpSink = (): void => {
  let lastSentCount = 0;
  let flushes = 0;
  const sentSeries = new Map<string, number>();
  const sentGauges = new Map<string, number>();
  const sentCounters = new Map<string, number>();
  trustGraphqlOrigin();

  const flush = () => {
    const count = totalCount() + gaugeUpdateCount() + counterUpdateCount();
    if (count === lastSentCount) return;
    lastSentCount = count;
    const full = flushes % FULL_SNAPSHOT_EVERY === 0;
    flushes += 1;
    post('/v1/metrics', JSON.stringify(buildMetricsPayload(
      changedOnly(seriesSnapshot(), sentSeries, (item) => item.count, full),
      Date.now(),
      changedOnly(gaugeSnapshot(), sentGauges, (item) => item.ts, full).map(({ item }) => item),
      changedOnly(counterSnapshot(), sentCounters, (item) => item.value, full),
    )));
  };

  window.setInterval(flush, getConfig().flushIntervalMs);
  window.addEventListener('pagehide', flush);
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
};

export default startOtlpSink;
