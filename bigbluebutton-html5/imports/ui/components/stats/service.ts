import { calculateJitterBufferAverage, getDataType } from '/imports/utils/stats';
import { calculateBitsPerSecond, calculateBitsPerSecondFromMultipleData } from '../connection-status/service';
import logger from '/imports/startup/client/logger';
import {
  MetricsData,
  IntervalData,
  NetworkDataArgs,
  Probes,
  PacketsStatistics,
} from './types';

export const LOG_MEDIA_STATS = () => (
  window.meetingClientSettings.public.stats.logMediaStats.enabled);

export const buildData = (inboundRTP: RTCInboundRtpStreamStats) => {
  const builtData = {
    packets: {
      received: inboundRTP.packetsReceived || 0,
      lost: inboundRTP.packetsLost || 0,
    },
    bytes: {
      received: inboundRTP.bytesReceived || 0,
    },
    jitter: inboundRTP.jitter || 0,
  };

  return builtData;
};

const diff = (single: boolean, first: number, last: number) => Math.abs((single ? 0 : last) - first);

export const calculateInterval = (stats: IntervalData[]) => {
  const single = stats.length === 1;
  const first = stats[0];
  const last = stats[stats.length - 1];

  return {
    packets: {
      received: diff(single, first.packets.received, last.packets.received),
      lost: diff(single, first.packets.lost, last.packets.lost),
    },
    bytes: {
      received: diff(single, first.bytes.received, last.bytes.received),
    },
    jitter: Math.max(...stats.map((s) => s.jitter)),
  };
};

const calculateLoss = (rate: number) => 1 - (rate / 100);

const calculateMOS = (rate: number) => 1 + (0.035) * rate + (0.000007) * rate * (rate - 60) * (100 - rate);

const calculateRate = (packets: PacketsStatistics) => {
  const { received, lost } = packets;
  const rate = (received > 0) ? ((received - lost) / received) * 100 : 100;
  if (rate < 0 || rate > 100) return 100;
  return rate;
};

const buildResult = (interval: IntervalData): MetricsData => {
  const rate = calculateRate(interval.packets);
  return {
    packets: {
      received: interval.packets.received,
      lost: interval.packets.lost,
    },
    bytes: {
      received: interval.bytes.received,
    },
    jitter: interval.jitter,
    rate,
    loss: calculateLoss(rate),
    MOS: calculateMOS(rate),
  };
};

const clearResult = () => {
  const cleanStats = {
    packets: {
      received: 0,
      lost: 0,
    },
    bytes: {
      received: 0,
    },
    jitter: 0,
    rate: 0,
    loss: 0,
    MOS: 0,
  };

  return cleanStats;
};

export const generateMetrics = (rawProbesStats: Probes) => {
  const statsRead: IntervalData[] = [];
  const { audio } = rawProbesStats;
  audio.forEach((audioProbe) => {
    const inboundRTP = getDataType(audioProbe, 'inbound-rtp')[0];
    const remoteInboundRTP = getDataType(audioProbe, 'remote-inbound-rtp')[0];
    if (inboundRTP || remoteInboundRTP) {
      if (!inboundRTP) {
        logger.debug(
          { logCode: 'stats_missing_inbound_rtc' },
          'Missing local inbound RTC. Using remote instead',
        );
      }
      return statsRead.push(buildData(inboundRTP || remoteInboundRTP));
    }
    return null;
  });
  if (!statsRead || statsRead.length === 0) return clearResult();
  const interval = calculateInterval(statsRead);
  return buildResult(interval);
};

export const calculateMetricsForNetworkData = ({
  previousLastProbe,
  lastProbe,
  allProbes,
}: NetworkDataArgs) => {
  const {
    outbound: audioCurrentUploadRate,
    inbound: audioCurrentDownloadRate,
  } = calculateBitsPerSecond(lastProbe.audio, previousLastProbe.audio);
  const inboundRtp = getDataType(lastProbe.audio, 'inbound-rtp')[0];

  const jitter = inboundRtp
    ? calculateJitterBufferAverage(inboundRtp)
    : 0;

  const packetsLost = inboundRtp
    ? inboundRtp.packetsLost
    : 0;

  const audio = {
    audioCurrentUploadRate,
    audioCurrentDownloadRate,
    jitter,
    packetsLost,
    transportStats: (lastProbe?.audio?.transportStats || {}) as Record<string, unknown>,
  };

  const {
    outbound: webcamsCurrentUploadRate,
    inbound: webcamsCurrentDownloadRate,
  } = calculateBitsPerSecondFromMultipleData(lastProbe?.video,
    previousLastProbe.video);

  const {
    outbound: screenshareCurrentUploadRate,
    inbound: screenshareCurrentDownloadRate,
  } = calculateBitsPerSecond(lastProbe?.screenshare, previousLastProbe?.screenshare);

  const video = {
    videoCurrentUploadRate: webcamsCurrentUploadRate + screenshareCurrentUploadRate,
    videoCurrentDownloadRate: webcamsCurrentDownloadRate + screenshareCurrentDownloadRate,
    screenshareTransportStats: lastProbe.screenshare?.transportStats || {},
  };

  const metrics = generateMetrics(allProbes);
  const networkData = {
    ready: true,
    audio,
    video,
    metrics,
  };

  return networkData;
};

export default calculateMetricsForNetworkData;
