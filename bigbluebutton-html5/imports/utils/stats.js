import logger from '/imports/startup/client/logger';

const STATS_LENGTH = 5;
const STATS_INTERVAL = 2000;

const stop = callback => {
  logger.info(
    {
      logCode: 'stats_stop_monitor'
    },
    'Lost peer connection. Stopping monitor'
  );
  callback(clearResult());
  return;
};

const collect = (conn, callback) => {
  let stats = [];

  const monitor = (conn, stats) => {
    if (!conn) return stop(callback);

    conn.getStats().then(results => {
      if (!results) return stop(callback);

      let inboundRTP;
      let remoteInboundRTP;

      results.forEach(res => {
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
          const { peerIdentity } = conn;
          logger.warn(
            {
              logCode: 'missing_inbound_rtc',
              extraInfo: { peerIdentity }
            },
            'Missing local inbound RTC. Using remote instead'
          );
        }

        stats.push(buildData(inboundRTP || remoteInboundRTP));
        while (stats.length > STATS_LENGTH) stats.shift();

        const interval = calculateInterval(stats);
        callback(buildResult(interval));
      }

      setTimeout(monitor, STATS_INTERVAL, conn, stats);
    }).catch(error => logger.error(error));
  };
  monitor(conn, stats);
};

const buildData = inboundRTP => {
  return {
    packets: {
      received: inboundRTP.packetsReceived,
      lost: inboundRTP.packetsLost
    },
    bytes: {
      received: inboundRTP.bytesReceived
    },
    jitter: inboundRTP.jitter
  };
};

const buildResult = (interval) => {
  const rate = calculateRate(interval.packets);
  return {
    packets: {
      received: interval.packets.received,
      lost: interval.packets.lost
    },
    bytes: {
      received: interval.bytes.received
    },
    jitter: interval.jitter,
    rate: rate,
    loss: calculateLoss(rate),
    MOS: calculateMOS(rate)
  };
};

const clearResult = () => {
  return {
    packets: {
      received: 0,
      lost: 0
    },
    bytes: {
      received: 0
    },
    jitter: 0,
    rate: 0,
    loss: 0,
    MOS: 0
  };
};

const diff = (single, first, last) => Math.abs((single ? 0 : last) - first);

const calculateInterval = (stats) => {
  const single = stats.length === 1;
  const first = stats[0];
  const last = stats[stats.length - 1];
  return {
    packets: {
      received: diff(single, first.packets.received, last.packets.received),
      lost: diff(single, first.packets.lost, last.packets.lost)
    },
    bytes: {
      received: diff(single, first.bytes.received, last.bytes.received)
    },
    jitter: Math.max.apply(Math, stats.map(s => s.jitter))
  };
};

const calculateRate = (packets) => {
  const { received, lost } = packets;
  const rate = (received > 0) ? ((received - lost) / received) * 100 : 100;
  if (rate < 0 || rate > 100) return 100;
  return rate;
};

const calculateLoss = (rate) => {
  return 1 - (rate / 100);
};

const calculateMOS = (rate) => {
  return 1 + (0.035) * rate + (0.000007) * rate * (rate - 60) * (100 - rate);
};

const monitorAudioConnection = conn => {
  if (!conn) return;

  const { peerIdentity } = conn;
  logger.info(
    {
      logCode: 'stats_audio_monitor',
      extraInfo: { peerIdentity }
    },
    'Starting to monitor audio connection'
  );

  collect(conn, (result) => {
    const event = new CustomEvent('audiostats', { detail: result });
    window.dispatchEvent(event);
  });
};

const monitorVideoConnection = conn => {
  if (!conn) return;

  const { peerIdentity } = conn;
  logger.info(
    {
      logCode: 'stats_video_monitor',
      extraInfo: { peerIdentity }
    },
    'Starting to monitor video connection'
  );

  collect(conn, (result) => {
    const event = new CustomEvent('videostats', { detail: result });
    window.dispatchEvent(event);
  });
};

export {
  monitorAudioConnection,
  monitorVideoConnection
}
