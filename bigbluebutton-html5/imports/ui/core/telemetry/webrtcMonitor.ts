import logger from '/imports/startup/client/logger';
import { getConfig } from './config';
import type { LogRecordInput } from './sinks/otlp';
import { setGauge } from './store';

// WebRTC quality with ObserveRTC's client monitor (https://observertc.org), loaded from its own file
// (public/compatibility) so sessions without telemetry.webrtcMonitor never download it. It works on any
// RTCPeerConnection; each one is labeled with where it comes from, so LiveKit and bbb-webrtc-sfu
// can be told apart in the backend (bbb.webrtc.source).

// One issue type can fire on every collection; one log per type and source per minute is enough
const ISSUE_LOG_INTERVAL_MS = 60_000;

// livekit: created inside livekit-client (anything not labeled otherwise)
// sfu: bbb-webrtc-sfu peers (webrtc-base/peer.js)
// loopback: local audio loopback, both ends in this tab; never monitored, it would skew the score
export type WebrtcSource = 'livekit' | 'sfu' | 'loopback';
const DEFAULT_SOURCE: WebrtcSource = 'livekit';

interface PeerConnectionMonitorLike {
  peerConnectionId: string;
  avgRttInSec?: number;
  score?: number;
  closed?: boolean;
  attachments?: Record<string, unknown>;
}

interface ClientMonitorLike {
  addSource(source: RTCPeerConnection): void;
  on(event: 'score', listener: (payload: { clientScore: number }) => void): void;
  on(event: 'issue', listener: (issue: { type: string; payload?: unknown }) => void): void;
  readonly peerConnections: PeerConnectionMonitorLike[];
  close(): void;
}

declare global {
  interface Window {
    BBBObserveRTC?: {
      ClientMonitor: new (config: { collectingPeriodInMs: number }) => ClientMonitorLike;
    };
  }
}

export interface WebrtcSourceQuality {
  score: number | null;
  worstRttMs: number | null;
  peerConnections: number;
  issues: Record<string, number>;
}

export interface WebrtcQuality {
  score: number | null;
  sources: Partial<Record<WebrtcSource, WebrtcSourceQuality>>;
}

const quality: WebrtcQuality = { score: null, sources: {} };
const lastIssueLogAt = new Map<string, number>();
const sourceByPeerConnectionId = new Map<string, WebrtcSource>();
let creatingSource: WebrtcSource | null = null;
let pending: { pc: RTCPeerConnection; source: WebrtcSource }[] = [];
let attach: ((pc: RTCPeerConnection, source: WebrtcSource) => void) | null = null;

export const webrtcQuality = (): WebrtcQuality => ({
  score: quality.score,
  sources: Object.fromEntries(Object.entries(quality.sources).map(([source, q]) => (
    [source, { ...q, issues: { ...q.issues } }]
  ))),
});

// BBB code that creates its own peer connections labels them here; the call is synchronous, so the
// label is read by the constructor below. Costs one assignment when the monitor is off.
export const withWebrtcSource = <T>(source: WebrtcSource, create: () => T): T => {
  creatingSource = source;
  try {
    return create();
  } finally {
    creatingSource = null;
  }
};

const sourceQuality = (source: WebrtcSource): WebrtcSourceQuality => {
  if (!quality.sources[source]) {
    quality.sources[source] = {
      score: null, worstRttMs: null, peerConnections: 0, issues: {},
    };
  }
  return quality.sources[source] as WebrtcSourceQuality;
};

// Must run before any peer connection exists. Instances still behave as RTCPeerConnection
// (instanceof, statics), the subclass only reports them to the monitor.
const capturePeerConnections = (): boolean => {
  const Native = window.RTCPeerConnection;
  if (!Native) return false;
  class MonitoredRTCPeerConnection extends Native {
    constructor(configuration?: RTCConfiguration) {
      super(configuration);
      const source = creatingSource ?? DEFAULT_SOURCE;
      if (source === 'loopback') return;
      if (attach) attach(this, source);
      else pending.push({ pc: this, source });
    }
  }
  window.RTCPeerConnection = MonitoredRTCPeerConnection;
  return true;
};

const loadScript = (src: string): Promise<void> => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.src = src;
  script.async = true;
  script.onload = () => resolve();
  script.onerror = () => reject(new Error(`Could not load ${src}`));
  document.head.appendChild(script);
});

const sourceOf = (pcMonitor: PeerConnectionMonitorLike): WebrtcSource => (
  sourceByPeerConnectionId.get(pcMonitor.peerConnectionId)
  ?? (pcMonitor.attachments?.bbbSource as WebrtcSource | undefined)
  ?? DEFAULT_SOURCE
);

// Issue payloads carry ids, numbers and sometimes device labels; only numbers and booleans go out
const numericFields = (payload: unknown): Record<string, number> => {
  if (!payload || typeof payload !== 'object') return {};
  const fields: Record<string, number> = {};
  Object.entries(payload as Record<string, unknown>).forEach(([key, value]) => {
    if (typeof value === 'number' && Number.isFinite(value)) fields[`bbb.webrtc.issue.${key}`] = value;
    if (typeof value === 'boolean') fields[`bbb.webrtc.issue.${key}`] = value ? 1 : 0;
  });
  return fields;
};

const issueSource = (payload: unknown): WebrtcSource | 'unknown' => {
  const id = (payload as { peerConnectionId?: unknown } | undefined)?.peerConnectionId;
  return typeof id === 'string' ? (sourceByPeerConnectionId.get(id) ?? DEFAULT_SOURCE) : 'unknown';
};

const reportIssue = (type: string, payload: unknown) => {
  const source = issueSource(payload);
  if (source !== 'unknown') {
    const { issues } = sourceQuality(source);
    issues[type] = (issues[type] ?? 0) + 1;
  }
  const config = getConfig();
  if (!config.logToServer) return;
  const key = `${source}|${type}`;
  const now = Date.now();
  if (now - (lastIssueLogAt.get(key) ?? 0) < ISSUE_LOG_INTERVAL_MS) return;
  lastIssueLogAt.set(key, now);

  const fields = numericFields(payload);
  logger.warn({
    logCode: 'webrtc_issue',
    extraInfo: { issueType: type, source, ...fields },
  }, `WebRTC issue: ${type} (${source})`);
  if (config.exporter === 'otlp') {
    import('./sinks/otlp')
      .then(({ sendLogs }) => sendLogs([{
        severity: 'WARN',
        body: `WebRTC issue on ${source}: ${type}`,
        attributes: {
          'event.name': 'bbb.webrtc_issue',
          'bbb.kind': 'webrtc',
          'bbb.webrtc.source': source,
          'bbb.webrtc.issue_type': type,
          ...fields,
        },
      }]))
      .catch(() => {
        // The client log record above carries the same issue
      });
  }
};

// Per source: the worst score and the worst RTT among its open peer connections
const updateSources = (monitor: ClientMonitorLike) => {
  const grouped = new Map<WebrtcSource, PeerConnectionMonitorLike[]>();
  monitor.peerConnections.filter((pc) => !pc.closed).forEach((pc) => {
    const source = sourceOf(pc);
    grouped.set(source, [...(grouped.get(source) ?? []), pc]);
  });
  (Object.keys(quality.sources) as WebrtcSource[]).forEach((source) => {
    if (!grouped.has(source)) sourceQuality(source).peerConnections = 0;
  });
  grouped.forEach((pcs, source) => {
    const q = sourceQuality(source);
    q.peerConnections = pcs.length;
    const scores = pcs.map((pc) => pc.score).filter((s): s is number => typeof s === 'number');
    const rtts = pcs.map((pc) => pc.avgRttInSec).filter((r): r is number => typeof r === 'number');
    const attributes = { 'bbb.webrtc.source': source };
    if (scores.length) {
      q.score = Math.round(Math.min(...scores) * 100) / 100;
      setGauge('bbb.client.webrtc.score', '1', attributes, q.score);
    }
    if (rtts.length) {
      q.worstRttMs = Math.round(Math.max(...rtts) * 1000);
      setGauge('bbb.client.webrtc.rtt', 'ms', attributes, q.worstRttMs);
    }
  });
};

// One summary per source with open peer connections, sent with the other kinds by the emitter.
// Sent on every flush while media is up, so a good call shows up too, not only issues.
export const webrtcSummaries = (): LogRecordInput[] => (
  (Object.entries(quality.sources) as [WebrtcSource, WebrtcSourceQuality][])
    .filter(([, q]) => q.peerConnections > 0)
    .map(([source, q]) => {
      const issueCount = Object.values(q.issues).reduce((sum, n) => sum + n, 0);
      const issueList = Object.entries(q.issues).map(([type, n]) => `${type} x${n}`).join(', ');
      logger.info({
        logCode: 'perf_webrtc',
        extraInfo: { source, ...q },
      }, `Client telemetry summary: webrtc ${source}`);
      return {
        severity: 'INFO' as const,
        body: `webrtc ${source}: score ${q.score ?? '?'}, worst RTT ${q.worstRttMs ?? '?'} ms, `
          + `${q.peerConnections} peer connection(s)${issueList ? `. Issues: ${issueList}` : ''}`,
        attributes: {
          'event.name': 'bbb.perf_summary',
          'bbb.kind': 'webrtc',
          'bbb.webrtc.source': source,
          'bbb.webrtc.peer_connections': q.peerConnections,
          'bbb.webrtc.issue_count': issueCount,
          ...(q.score !== null ? { 'bbb.webrtc.score': q.score } : {}),
          ...(q.worstRttMs !== null ? { 'bbb.webrtc.rtt_ms': q.worstRttMs } : {}),
          ...(issueList ? { 'bbb.webrtc.issues': issueList } : {}),
        },
      };
    })
);

const startWebrtcMonitor = (): void => {
  const { webrtcMonitor } = getConfig();
  if (!webrtcMonitor.enabled || !capturePeerConnections()) return;

  loadScript(webrtcMonitor.scriptUrl)
    .then(() => {
      const ClientMonitor = window.BBBObserveRTC?.ClientMonitor;
      if (!ClientMonitor) throw new Error('BBBObserveRTC.ClientMonitor missing');
      const monitor = new ClientMonitor({ collectingPeriodInMs: webrtcMonitor.collectingPeriodMs });

      attach = (pc, source) => {
        const known = new Set(monitor.peerConnections);
        monitor.addSource(pc);
        monitor.peerConnections.filter((pcMonitor) => !known.has(pcMonitor)).forEach((pcMonitor) => {
          sourceByPeerConnectionId.set(pcMonitor.peerConnectionId, source);
          // eslint-disable-next-line no-param-reassign
          pcMonitor.attachments = { ...pcMonitor.attachments, bbbSource: source };
        });
      };
      pending.forEach(({ pc, source }) => attach?.(pc, source));
      pending = [];

      monitor.on('score', ({ clientScore }) => {
        quality.score = Math.round(clientScore * 100) / 100;
        updateSources(monitor);
      });
      monitor.on('issue', ({ type, payload }) => reportIssue(type, payload));
      window.addEventListener('pagehide', () => monitor.close());
    })
    .catch((error: Error) => {
      // Peer connections keep working through the subclass; only the quality data is missing
      attach = () => {};
      pending = [];
      logger.warn({
        logCode: 'telemetry_webrtc_monitor_error',
        extraInfo: { errorMessage: error.message },
      }, 'Could not start the WebRTC quality monitor');
    });
};

export default startWebrtcMonitor;
