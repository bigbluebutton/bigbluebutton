import {
  Track,
  type Room,
  type LocalAudioTrack,
  type LocalVideoTrack,
  type RemoteAudioTrack,
  type RemoteVideoTrack,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';

type StatKind = 'audio' | 'video';

type AnyStat = Record<string, unknown> & { id: string; type: string; kind?: string };

type AggrStatType = 'inbound-rtp' | 'outbound-rtp';

const COUNTER_FIELDS_BY_TYPE: Record<AggrStatType, readonly string[]> = {
  'inbound-rtp': [
    'bytesReceived',
    'packetsReceived',
    'packetsLost',
    'headerBytesReceived',
    'jitterBufferDelay',
    'jitterBufferEmittedCount',
  ],
  'outbound-rtp': [
    'bytesSent',
    'packetsSent',
    'headerBytesSent',
    'retransmittedBytesSent',
    'retransmittedPacketsSent',
    'nackCount',
  ],
};

type PerTrackSnapshot = Record<string, number>;

// Aggregators: per-SSRC baselines + monotonic running totals. Positive deltas
// only: disappearing SSRCS freeze their contribution, new sources have to
// establish a probe baseline first.
interface RtpAggregator {
  lastSeen: Map<number, PerTrackSnapshot>;
  cumulative: Record<string, number>;
}

const createAggregator = (counterFields: readonly string[]): RtpAggregator => ({
  lastSeen: new Map<number, PerTrackSnapshot>(),
  cumulative: counterFields.reduce<Record<string, number>>((acc, field) => {
    acc[field] = 0;
    return acc;
  }, {}),
});

const rtpAggregators: Record<string, RtpAggregator> = {};

const getAggregator = (
  statType: AggrStatType,
  kind: StatKind,
  source: Track.Source | undefined,
): RtpAggregator => {
  const key = `${statType}:${kind}:${source ?? 'any'}`;
  const existing = rtpAggregators[key];

  if (existing) return existing;

  const created = createAggregator(COUNTER_FIELDS_BY_TYPE[statType]);
  rtpAggregators[key] = created;

  return created;
};

const snapshotFromStat = (stat: AnyStat, counterFields: readonly string[]): PerTrackSnapshot => {
  const snap: PerTrackSnapshot = { timestamp: (stat.timestamp as number) ?? 0 };

  counterFields.forEach((field) => {
    snap[field] = (stat[field] as number) ?? 0;
  });

  return snap;
};

// Merges RTP entries of a given kind into a single entry with monotonic
// cumulative counters, built from per-SSRC deltas. Needed because downstream
// consumers take the first entry as representative (audio bridge parseStats,
// generateMetrics, calculateBitsPerSecond) or reduce by type (screenshare
// parseStats collapses simulcast layers to one).
// Per-SSRC delta accumulation (vs. per-probe sum) keeps counters monotonic -
// no negative bitrates, no false loss alerts.
const aggregateRtpByKind = (
  statsMap: Map<string, AnyStat>,
  statType: AggrStatType,
  kind: StatKind,
  source: Track.Source | undefined,
): void => {
  const matching: AnyStat[] = [];

  statsMap.forEach((stat) => {
    if (stat.type === statType && stat.kind === kind) matching.push(stat);
  });

  if (matching.length === 0) return;

  const counterFields = COUNTER_FIELDS_BY_TYPE[statType];
  const aggregator = getAggregator(statType, kind, source);
  const seenSsrcs = new Set<number>();
  let maxJitter = 0;
  let latestTimestamp = 0;

  matching.forEach((stat) => {
    const ssrc = stat.ssrc as number | undefined;

    if (ssrc == null) return;

    seenSsrcs.add(ssrc);

    const current = snapshotFromStat(stat, counterFields);
    const prev = aggregator.lastSeen.get(ssrc);
    if (prev) {
      counterFields.forEach((field) => {
        // Clamp negative deltas to keep the running total monotonic
        const delta = current[field] - prev[field];

        if (delta > 0) aggregator.cumulative[field] += delta;
      });
    }
    aggregator.lastSeen.set(ssrc, current);

    maxJitter = Math.max(maxJitter, (stat.jitter as number) ?? 0);
    latestTimestamp = Math.max(latestTimestamp, current.timestamp);
  });

  // Drop stale SSRCs; their contribution is already frozen in aggr.cumulative.
  aggregator.lastSeen.forEach((_, ssrc) => {
    if (!seenSsrcs.has(ssrc)) aggregator.lastSeen.delete(ssrc);
  });

  const first = matching[0];
  const statsAggregation: AnyStat = {
    ...first,
    id: `lk-aggregated-${statType}-${kind}`,
    timestamp: latestTimestamp,
  };

  if (statType === 'inbound-rtp') statsAggregation.jitter = maxJitter;

  counterFields.forEach((field) => {
    statsAggregation[field] = aggregator.cumulative[field];
  });

  matching.forEach((s) => statsMap.delete(s.id));

  statsMap.set(statsAggregation.id, statsAggregation);
};

type AnyTrack = LocalAudioTrack | LocalVideoTrack | RemoteAudioTrack | RemoteVideoTrack;

const getReportFromTrack = async (
  track: AnyTrack | undefined | null,
): Promise<RTCStatsReport | null> => {
  if (!track || typeof (track as { getRTCStatsReport?: unknown }).getRTCStatsReport !== 'function') {
    return null;
  }

  try {
    const report = await track.getRTCStatsReport();
    return report ?? null;
  } catch (error) {
    logger.error({
      logCode: 'livekit_stats_get_report_error',
      extraInfo: {
        errorMessage: (error as Error)?.message,
        errorName: (error as Error)?.name,
        errorStack: (error as Error)?.stack,
      },
    }, 'LiveKit stats report unavailable for track');

    return null;
  }
};

export interface GetLiveKitStatsOptions {
  room: Room;
  kind: StatKind;
  // Filters local + remote pubs by source (Microphone, Camera, ScreenShare).
  source?: Track.Source;
  // Merge multiple inbound-rtp entries into a single one. See aggregateRtpByKind.
  aggregateInbound?: boolean;
  // Merge multiple outbound-rtp entries (e.g. simulcast layers) into a single one. See aggregateRtpByKind.
  aggregateOutbound?: boolean;
}

// Collects raw RTC stats from LiveKit via public per-track getRTCStatsReport,
// Returns a flat Map compatible with the media bridge's parseStats pipeline.
// With no local tracks (listen-only), only subscriber-side stats populate
// the map.
export const getLiveKitStats = async ({
  room,
  kind,
  source,
  aggregateInbound = false,
  aggregateOutbound = false,
}: GetLiveKitStatsOptions): Promise<Map<string, unknown>> => {
  const statsMap = new Map<string, AnyStat>();

  if (!room?.localParticipant) return statsMap as Map<string, unknown>;

  let localPubs;

  if (source) {
    const pub = room.localParticipant.getTrackPublication(source);
    localPubs = pub ? [pub] : [];
  } else {
    localPubs = Array.from(room.localParticipant.trackPublications.values())
      .filter((p) => p.track?.kind === kind);
  }

  await Promise.all(localPubs.map(async (pub) => {
    const report = await getReportFromTrack(pub?.track as AnyTrack | undefined);

    if (!report) return;

    report.forEach((stat) => {
      statsMap.set(stat.id, stat as unknown as AnyStat);
    });
  }));

  await Promise.all(
    Array.from(room.remoteParticipants.values()).flatMap((participant) => {
      const remotePubs = kind === 'audio'
        ? Array.from(participant.audioTrackPublications.values())
        : Array.from(participant.videoTrackPublications.values());

      return remotePubs
        .filter((pub) => !source || pub.source === source)
        .map(async (pub) => {
          const report = await getReportFromTrack(pub.track as AnyTrack | undefined);

          if (!report) return;

          report.forEach((stat) => {
            statsMap.set(stat.id, stat as unknown as AnyStat);
          });
        });
    }),
  );

  if (aggregateInbound) aggregateRtpByKind(statsMap, 'inbound-rtp', kind, source);

  if (aggregateOutbound) aggregateRtpByKind(statsMap, 'outbound-rtp', kind, source);

  return statsMap as Map<string, unknown>;
};

export default {
  getLiveKitStats,
};
