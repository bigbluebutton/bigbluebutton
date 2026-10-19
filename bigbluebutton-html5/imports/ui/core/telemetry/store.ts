import seriesFor from './semconv';
import {
  GaugeSnapshot,
  KindStats,
  SeriesAttributes,
  SeriesSnapshot,
  TelemetryEntry,
  TelemetryKind,
} from './types';

// Histogram bounds in ms. 16 is one frame at 60 fps; the rest match the graphql-middleware ones.
export const BUCKET_BOUNDS = [16, 50, 100, 250, 500, 1000, 2500, 5000, 10000];

// Durations kept per kind to compute p50/p95 for the debug window and the log summary
const RECENT_SAMPLES = 500;
// Cap on metric + attribute combinations; anything past it is folded into one overflow series
const MAX_SERIES = 100;
const OVERFLOW_ATTRIBUTES: SeriesAttributes = { 'bbb.series.overflow': 'true' };

class Ring<T> {
  private readonly items: T[] = [];

  private readonly capacity: number;

  private next = 0;

  constructor(capacity: number) {
    this.capacity = Math.max(1, capacity);
  }

  push(item: T): void {
    if (this.items.length < this.capacity) {
      this.items.push(item);
    } else {
      this.items[this.next] = item;
    }
    this.next = (this.next + 1) % this.capacity;
  }

  values(): T[] {
    return this.items.slice();
  }
}

interface KindState {
  count: number;
  max: number;
  recent: Ring<number>;
  slow: Ring<TelemetryEntry>;
}

let slowBufferSize = 200;

const newKindState = (): KindState => ({
  count: 0,
  max: 0,
  recent: new Ring<number>(RECENT_SAMPLES),
  slow: new Ring<TelemetryEntry>(slowBufferSize),
});

const createKinds = (): Record<TelemetryKind, KindState> => ({
  render: newKindState(),
  request: newKindState(),
  graphql: newKindState(),
  longtask: newKindState(),
  interaction: newKindState(),
});

let kinds = createKinds();
const series = new Map<string, SeriesSnapshot>();
const gauges = new Map<string, GaugeSnapshot>();
let gaugeUpdates = 0;

const seriesKey = (metric: string, attributes: SeriesAttributes) => (
  `${metric}|${Object.keys(attributes).map((key) => `${key}=${attributes[key]}`).join('|')}`
);

const bucketIndex = (duration: number): number => {
  const index = BUCKET_BOUNDS.findIndex((bound) => duration <= bound);
  return index === -1 ? BUCKET_BOUNDS.length : index;
};

const createSeries = (
  key: string,
  metric: string,
  attributes: SeriesAttributes,
): SeriesSnapshot => {
  const created: SeriesSnapshot = {
    metric,
    attributes,
    count: 0,
    sum: 0,
    min: Infinity,
    max: 0,
    bucketCounts: new Array(BUCKET_BOUNDS.length + 1).fill(0),
  };
  series.set(key, created);
  return created;
};

const findOrCreateSeries = (metric: string, attributes: SeriesAttributes): SeriesSnapshot => {
  const key = seriesKey(metric, attributes);
  const existing = series.get(key);
  if (existing) return existing;

  if (series.size >= MAX_SERIES) {
    const overflowKey = seriesKey(metric, OVERFLOW_ATTRIBUTES);
    const overflow = series.get(overflowKey);
    if (overflow) return overflow;
    return createSeries(overflowKey, metric, OVERFLOW_ATTRIBUTES);
  }
  return createSeries(key, metric, attributes);
};

const aggregate = (entry: TelemetryEntry): void => {
  const { metric, attributes } = seriesFor(entry);
  const target = findOrCreateSeries(metric, attributes);
  target.count += 1;
  target.sum += entry.duration;
  target.min = Math.min(target.min, entry.duration);
  target.max = Math.max(target.max, entry.duration);
  target.bucketCounts[bucketIndex(entry.duration)] += 1;
};

export const configureStore = (bufferSize: number): void => {
  slowBufferSize = bufferSize;
  kinds = createKinds();
};

export const recordEntry = (entry: TelemetryEntry, isSlow: boolean): void => {
  const state = kinds[entry.kind];
  state.count += 1;
  state.max = Math.max(state.max, entry.duration);
  state.recent.push(entry.duration);
  if (isSlow) state.slow.push(entry);
  aggregate(entry);
};

export const topSlowest = (kind: TelemetryKind, limit: number): TelemetryEntry[] => (
  kinds[kind].slow.values().sort((a, b) => b.duration - a.duration).slice(0, limit)
);

const round = (value: number) => Math.round(value * 10) / 10;

const quantile = (sorted: number[], q: number): number => {
  if (sorted.length === 0) return 0;
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
};

export const kindStats = (kind: TelemetryKind): KindStats => {
  const state = kinds[kind];
  const sorted = state.recent.values().sort((a, b) => a - b);
  return {
    count: state.count,
    p50: round(quantile(sorted, 0.5)),
    p95: round(quantile(sorted, 0.95)),
    max: round(state.max),
  };
};

// Total number of measurements so far; sinks use it to skip sends when nothing changed
export const totalCount = (): number => Object.values(kinds).reduce((sum, state) => sum + state.count, 0);

export const seriesSnapshot = (): SeriesSnapshot[] => Array.from(series.values()).map((item) => ({
  ...item,
  attributes: { ...item.attributes },
  bucketCounts: item.bucketCounts.slice(),
}));

export const setGauge = (metric: string, unit: string, attributes: SeriesAttributes, value: number): void => {
  gauges.set(seriesKey(metric, attributes), {
    metric,
    unit,
    attributes,
    value,
    ts: Date.now(),
  });
  gaugeUpdates += 1;
};

export const gaugeSnapshot = (): GaugeSnapshot[] => Array.from(gauges.values()).map((item) => ({
  ...item,
  attributes: { ...item.attributes },
}));

// Number of gauge writes so far; sinks combine it with totalCount() to detect changes
export const gaugeUpdateCount = (): number => gaugeUpdates;

export const clearStore = (): void => {
  kinds = createKinds();
  series.clear();
  gauges.clear();
};
