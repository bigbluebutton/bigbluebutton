export interface Probe {
  audio: Record<string, unknown>;
  video: Record<string, unknown>;
  screenshare: Record<string, unknown>;
}

export interface Probes {
  audio: Record<string, unknown>[];
  video: Record<string, unknown>[];
  screenshare: Record<string, unknown>[];
}

export interface NetworkDataArgs {
  previousLastProbe: Probe;
  lastProbe: Probe;
  allProbes: Probes;
}

export interface PacketsStatistics {
  received: number,
  lost: number,
}

export interface IntervalData {
  packets: PacketsStatistics,
  bytes: {
    received: number,
  },
  jitter: number,
}

export interface MetricsData extends IntervalData {
  rate: number,
  loss: number,
  MOS: number,
}
