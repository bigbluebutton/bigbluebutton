import logger from '/imports/startup/client/logger';
import AudioManager from '/imports/ui/services/audio-manager';

let probingTimeout;

// Probes done in an interval
const PROBES = 5;

const diff = (single, first, last) => Math.abs((single ? 0 : last) - first);

const calculateInterval = (stats) => {
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

const calculateRate = (packets) => {
  const { received, lost } = packets;
  const rate = (received > 0) ? ((received - lost) / received) * 100 : 100;
  if (rate < 0 || rate > 100) return 100;
  return rate;
};

const calculateLoss = (rate) => 1 - (rate / 100);

const calculateMOS = (rate) => 1 + (0.035) * rate + (0.000007) * rate * (rate - 60) * (100 - rate);
const buildData = (inboundRTP) => {
  const builtData = {
    packets: {
      received: inboundRTP.packetsReceived,
      lost: inboundRTP.packetsLost,
    },
    bytes: {
      received: inboundRTP.bytesReceived,
    },
    jitter: inboundRTP.jitter,
  };

  return builtData;
};

const buildResult = (interval) => {
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

const stop = (callback) => {
  logger.debug(
    { logCode: 'stats_stop_monitor' },
    'Lost peer connection. Stopping monitor',
  );
  if (probingTimeout) {
    clearTimeout(probingTimeout);
    probingTimeout = null;
  }

  callback(clearResult());
};

const collect = (callback) => {
  const INTERVAL = window.meetingClientSettings.public.stats.interval / PROBES;

  const monitor = (statsRed) => {
    AudioManager.getStats().then((results) => {
      if (results) {
        let inboundRTP;
        let remoteInboundRTP;

        Object.values(results).forEach((res) => {
          switch (res.type) {
            case 'inbound-rtp':
              inboundRTP = res;
              break;
            case 'remote-inbound-rtp':
              remoteInboundRTP = res;
              break;
            default:
          }
        });

        if (inboundRTP || remoteInboundRTP) {
          if (!inboundRTP) {
            logger.debug(
              { logCode: 'stats_missing_inbound_rtc' },
              'Missing local inbound RTC. Using remote instead',
            );
          }

          statsRed.push(buildData(inboundRTP || remoteInboundRTP));
          while (statsRed.length > PROBES) statsRed.shift();

          const interval = calculateInterval(statsRed);
          callback(buildResult(interval));
        }
      }
    }).catch((error) => {
      logger.debug({
        logCode: 'stats_get_stats_error',
        extraInfo: {
          errorMessage: error.message,
          errorName: error.name,
        },
      }, 'WebRTC stats not available');
    }).finally(() => {
      probingTimeout = setTimeout(monitor, INTERVAL, statsRed);
    });
  };

  monitor([]);
};

export const monitorAudioConnection = () => {
  logger.debug(
    { logCode: 'stats_audio_monitor' },
    'Starting to monitor audio connection',
  );
  const callback = (result) => {
    const event = new CustomEvent('audiostats', { detail: result });
    window.dispatchEvent(event);
  };

  if (probingTimeout) stop(callback);

  collect(callback);
};

export default {
  monitorAudioConnection,
};
