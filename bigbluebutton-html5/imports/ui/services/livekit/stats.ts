import {
  type Room,
  Track,
  type LocalAudioTrack,
  type RemoteAudioTrack,
  type RemoteVideoTrack,
  type LocalVideoTrack,
} from 'livekit-client';
import logger from '/imports/startup/client/logger';

// Audio stats monitoring (i.e.: used by alert triggers in connection-status)

const PROBES = 5;

let probingTimeout: ReturnType<typeof setTimeout> | null = null;

interface ProbeSnapshot {
  packetsSent: number;
  packetsLost: number;
  bytesSent: number;
  jitterMs: number;
}

let statsWindow: ProbeSnapshot[] = [];

const calculateRate = (deltaSent: number, deltaLost: number): number => {
  const total = deltaSent + deltaLost;

  if (total <= 0) return 100;

  const rate = ((total - deltaLost) / total) * 100;

  if (rate < 0 || rate > 100) return 100;

  return rate;
};

const calculateLoss = (rate: number): number => 1 - (rate / 100);

const calculateMOS = (rate: number): number => (
  1 + (0.035) * rate + (0.000007) * rate * (rate - 60) * (100 - rate)
);

const buildResult = (
  first: ProbeSnapshot,
  last: ProbeSnapshot,
  single: boolean,
) => {
  const deltaSent = single ? 0 : last.packetsSent - first.packetsSent;
  const deltaLost = single ? 0 : last.packetsLost - first.packetsLost;
  const deltaBytes = single ? 0 : last.bytesSent - first.bytesSent;

  const rate = calculateRate(deltaSent, deltaLost);
  return {
    packets: {
      sent: deltaSent,
      lost: deltaLost,
    },
    bytes: {
      sent: deltaBytes,
    },
    jitter: last.jitterMs,
    rate,
    loss: calculateLoss(rate),
    MOS: calculateMOS(rate),
  };
};

const clearResult = () => ({
  packets: { sent: 0, lost: 0 },
  bytes: { sent: 0 },
  jitter: 0,
  rate: 0,
  loss: 0,
  MOS: 0,
});

const dispatchAudioStats = (result: ReturnType<typeof buildResult>) => {
  const event = new CustomEvent('audiostats', { detail: result });

  window.dispatchEvent(event);
};

const probe = async (room: Room) => {
  const publication = room.localParticipant
    ?.getTrackPublication(Track.Source.Microphone);
  const track = publication?.track as LocalAudioTrack | undefined;

  if (!track || typeof track.getSenderStats !== 'function') {
    dispatchAudioStats(clearResult());

    return;
  }

  try {
    const senderStats = await track.getSenderStats();

    if (!senderStats) return;

    const remoteStats = await getRemoteInboundAudioStats(track);

    const snapshot: ProbeSnapshot = {
      packetsSent: senderStats.packetsSent ?? 0,
      packetsLost: remoteStats.packetsLost,
      bytesSent: senderStats.bytesSent ?? 0,
      jitterMs: remoteStats.jitterMs,
    };

    statsWindow.push(snapshot);

    while (statsWindow.length > PROBES) {
      statsWindow.shift();
    }

    const first = statsWindow[0];
    const last = statsWindow[statsWindow.length - 1];
    const single = statsWindow.length === 1;
    const result = buildResult(first, last, single);

    dispatchAudioStats(result);
  } catch (error) {
    logger.debug({
      logCode: 'livekit_stats_get_sender_error',
      extraInfo: {
        errorMessage: (error as Error).message,
        errorName: (error as Error).name,
      },
    }, 'LiveKit audio sender stats not available');
  }
};

export const monitorLiveKitAudioStats = (room: Room, interval: number): void => {
  const probeInterval = interval / PROBES;
  const runProbe = () => {
    probe(room).finally(() => {
      probingTimeout = setTimeout(runProbe, probeInterval);
    });
  };

  stopLiveKitAudioStats();
  runProbe();
};

export const stopLiveKitAudioStats = (): void => {
  if (probingTimeout) {
    clearTimeout(probingTimeout);
    probingTimeout = null;
  }

  statsWindow = [];
};

// Stats data collection for connection-status modal (bandwidth, TURN usage etc)

interface PreviousTrackStats {
  bytesSent?: number;
  bytesReceived?: number;
  timestamp: number;
}

export type PreviousStatsMap = Map<string, PreviousTrackStats>;

export interface AudioNetworkData {
  audioCurrentUploadRate: number;
  audioCurrentDownloadRate: number;
  jitter: number;
  packetsLost: number;
  transportStats: { isUsingTurn?: boolean };
}

export interface VideoNetworkData {
  videoCurrentUploadRate: number;
  videoCurrentDownloadRate: number;
}

const computeKbps = (
  currentBytes: number,
  previousBytes: number,
  currentTimestamp: number,
  previousTimestamp: number,
): number => {
  const deltaBytes = currentBytes - previousBytes;
  const deltaTimeMs = currentTimestamp - previousTimestamp;

  if (deltaTimeMs <= 0 || deltaBytes < 0) return 0;

  // bytes/ms -> bytes/s -> bits/s -> kbps
  return Math.round((deltaBytes * 8 * 1000) / (deltaTimeMs * 1024));
};

/**
 * Extract stats from the remote-inbound-rtp entry in the raw RTCStatsReport.
 */
interface RemoteInboundAudioStats {
  jitterMs: number;
  packetsLost: number;
  fractionLost: number;
}

const getRemoteInboundAudioStats = async (
  track: LocalAudioTrack,
): Promise<RemoteInboundAudioStats> => {
  const empty = { jitterMs: 0, packetsLost: 0, fractionLost: 0 };

  if (typeof track.getRTCStatsReport !== 'function') return empty;

  try {
    const report = await track.getRTCStatsReport();
    if (!report) return empty;

    let result = empty;
    report.forEach((stat) => {
      if (stat.type === 'remote-inbound-rtp' && stat.kind === 'audio') {
        result = {
          jitterMs: Math.round((stat.jitter ?? 0) * 1000),
          packetsLost: stat.packetsLost ?? 0,
          fractionLost: stat.fractionLost ?? 0,
        };
      }
    });

    return result;
  } catch {
    return empty;
  }
};

const findTurnUsageFromReport = (
  report: RTCStatsReport,
): { isUsingTurn?: boolean } => {
  // Find the active candidate pair
  let activePairLocalId: string | null = null;
  report.forEach((stat) => {
    if (stat.type === 'candidate-pair'
      && (stat.state === 'succeeded' || stat.state === 'in-progress')
      && stat.nominated !== false) {
      activePairLocalId = stat.localCandidateId;
    }
  });

  if (!activePairLocalId) return {};

  // Find the local candidate referenced by the active pair
  let candidateType: string | null = null;
  report.forEach((stat) => {
    if (stat.type === 'local-candidate' && stat.id === activePairLocalId) {
      candidateType = stat.candidateType ?? null;
    }
  });

  return { isUsingTurn: candidateType === 'relay' };
};

const getTransportStats = async (
  room: Room,
): Promise<{ isUsingTurn?: boolean }> => {
  try {
    // Try local mic track first (publisher PC)
    const micPub = room.localParticipant?.getTrackPublication(Track.Source.Microphone);
    const micTrack = micPub?.track as LocalAudioTrack | undefined;

    if (micTrack && typeof micTrack.getRTCStatsReport === 'function') {
      const report = await micTrack.getRTCStatsReport();
      if (report) {
        const result = findTurnUsageFromReport(report);
        if (result.isUsingTurn != null) return result;
      }
    }

    // Fallback: any subscribed remote track (subscriber PC)
    // Covers listen-only mode where no local tracks are published
    // eslint-disable-next-line no-restricted-syntax
    for (const [, participant] of room.remoteParticipants) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [, pub] of participant.trackPublications) {
        const { track } = pub;
        if (track && typeof track.getRTCStatsReport === 'function') {
          // eslint-disable-next-line no-await-in-loop
          const report = await track.getRTCStatsReport();
          if (report) {
            const result = findTurnUsageFromReport(report);
            if (result.isUsingTurn != null) return result;
          }
        }
      }
    }

    return {};
  } catch {
    return {};
  }
};

export const getLiveKitAudioNetworkData = async (
  room: Room,
  previousStats: PreviousStatsMap,
): Promise<{ data: AudioNetworkData; previousStats: PreviousStatsMap }> => {
  const newPreviousStats: PreviousStatsMap = new Map();
  let audioUpload = 0;
  let audioDownload = 0;
  let audioJitter = 0;
  let audioPacketsLost = 0;

  // Audio upload (local microphone track)
  const micPub = room.localParticipant?.getTrackPublication(Track.Source.Microphone);
  const micTrack = micPub?.track as LocalAudioTrack | undefined;

  if (micPub && micTrack && typeof micTrack.getSenderStats === 'function') {
    try {
      const stats = await micTrack.getSenderStats();

      if (stats) {
        const sid = micPub?.trackSid;
        const prev = previousStats.get(sid);

        if (prev && prev.bytesSent != null) {
          audioUpload = computeKbps(
            stats.bytesSent ?? 0, prev.bytesSent,
            stats.timestamp, prev.timestamp,
          );
        }

        const remoteStats = await getRemoteInboundAudioStats(micTrack);
        audioJitter = remoteStats.jitterMs;
        audioPacketsLost = remoteStats.packetsLost;
        newPreviousStats.set(sid, {
          bytesSent: stats.bytesSent ?? 0,
          timestamp: stats.timestamp,
        });
      }
    } catch {
      // Track may have been removed between check and call
    }
  }

  // Audio download (subscribed remote audio tracks)
  await Promise.all(
    Array.from(room.remoteParticipants.values()).flatMap((participant) => (
      Array.from(participant.audioTrackPublications.values()).map(async (pub) => {
        const track = pub.track as RemoteAudioTrack | undefined;
        if (!track || typeof track.getReceiverStats !== 'function') return;

        try {
          const stats = await track.getReceiverStats();
          if (!stats) return;

          const sid = pub.trackSid ?? `audio-${participant.identity}`;
          const prev = previousStats.get(sid);
          if (prev && prev.bytesReceived != null) {
            audioDownload += computeKbps(
              stats.bytesReceived ?? 0, prev.bytesReceived,
              stats.timestamp, prev.timestamp,
            );
          }
          newPreviousStats.set(sid, {
            bytesReceived: stats.bytesReceived ?? 0,
            timestamp: stats.timestamp,
          });
        } catch {
          // Track may have been removed
        }
      })
    )),
  );

  const transportStats = await getTransportStats(room);

  return {
    data: {
      audioCurrentUploadRate: audioUpload,
      audioCurrentDownloadRate: audioDownload,
      jitter: audioJitter,
      packetsLost: audioPacketsLost,
      transportStats,
    },
    previousStats: newPreviousStats,
  };
};

export const getLiveKitVideoNetworkData = async (
  room: Room,
  previousStats: PreviousStatsMap,
): Promise<{ data: VideoNetworkData; previousStats: PreviousStatsMap }> => {
  const newPreviousStats: PreviousStatsMap = new Map();
  let videoUpload = 0;
  let videoDownload = 0;

  // Video upload (local camera + screenshare tracks)
  const localVideoPubs = [
    room.localParticipant?.getTrackPublication(Track.Source.Camera),
    room.localParticipant?.getTrackPublication(Track.Source.ScreenShare),
  ].filter(Boolean);

  await Promise.all(localVideoPubs.map(async (pub) => {
    const track = pub?.track as LocalVideoTrack | undefined;
    if (!track || typeof track.getSenderStats !== 'function') return;

    try {
      // VideoSenderStats[] — one per simulcast layer
      const statsArray = await track.getSenderStats();
      if (!statsArray || !Array.isArray(statsArray)) return;

      let totalBytesSent = 0;
      let latestTimestamp = 0;
      statsArray.forEach((layerStats) => {
        totalBytesSent += layerStats.bytesSent ?? 0;
        latestTimestamp = Math.max(latestTimestamp, layerStats.timestamp);
      });

      const sid = pub?.trackSid ?? `video-local-${track.source}`;
      const prev = previousStats.get(sid);
      if (prev && prev.bytesSent != null) {
        videoUpload += computeKbps(
          totalBytesSent, prev.bytesSent,
          latestTimestamp, prev.timestamp,
        );
      }
      newPreviousStats.set(sid, {
        bytesSent: totalBytesSent,
        timestamp: latestTimestamp,
      });
    } catch {
      // Track may have been removed
    }
  }));

  // Video download (subscribed remote video tracks)
  await Promise.all(
    Array.from(room.remoteParticipants.values()).flatMap((participant) => (
      Array.from(participant.videoTrackPublications.values()).map(async (pub) => {
        const track = pub.track as RemoteVideoTrack | undefined;
        if (!track || typeof track.getReceiverStats !== 'function') return;

        try {
          const stats = await track.getReceiverStats();
          if (!stats) return;

          const sid = pub.trackSid ?? `video-${participant.identity}`;
          const prev = previousStats.get(sid);
          if (prev && prev.bytesReceived != null) {
            videoDownload += computeKbps(
              stats.bytesReceived ?? 0, prev.bytesReceived,
              stats.timestamp, prev.timestamp,
            );
          }
          newPreviousStats.set(sid, {
            bytesReceived: stats.bytesReceived ?? 0,
            timestamp: stats.timestamp,
          });
        } catch {
          // Track may have been removed
        }
      })
    )),
  );

  return {
    data: {
      videoCurrentUploadRate: videoUpload,
      videoCurrentDownloadRate: videoDownload,
    },
    previousStats: newPreviousStats,
  };
};
