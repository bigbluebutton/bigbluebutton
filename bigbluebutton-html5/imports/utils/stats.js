import logger from '/imports/startup/client/logger';

const STATS = Meteor.settings.public.stats;

// Probes done in an interval
const PROBES = 5;
const INTERVAL = STATS.interval / PROBES;

const stop = callback => {
  logger.debug(
    { logCode: 'stats_stop_monitor' },
    'Lost peer connection. Stopping monitor'
  );
  callback(clearResult());
  return;
};

const isActive = conn => {
  let active = false;

  if (conn) {
    const { connectionState } = conn;
    const logCode = 'stats_connection_state';

    switch (connectionState) {
      case 'new':
      case 'connecting':
      case 'connected':
      case 'disconnected':
        active = true;
        break;
      case 'failed':
      case 'closed':
      default:
        logger.warn({ logCode }, connectionState);
    }
  } else {
    logger.error(
      { logCode: 'stats_missing_connection' },
      'Missing connection'
    );
  }

  return active;
};

const collect = (conn, callback) => {
  let stats = [];

  const monitor = (conn, stats) => {
    if (!isActive(conn)) return stop(callback);

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
          logger.debug(
            { logCode: 'stats_missing_inbound_rtc' },
            'Missing local inbound RTC. Using remote instead'
          );
        }

        stats.push(buildData(inboundRTP || remoteInboundRTP));
        while (stats.length > PROBES) stats.shift();

        const interval = calculateInterval(stats);
        callback(buildResult(interval));
      }

      setTimeout(monitor, INTERVAL, conn, stats);
    }).catch(error => {
      logger.debug(
        {
          logCode: 'stats_get_stats_error',
          extraInfo: { error }
        },
        'WebRTC stats not available'
      );
    });
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

  logger.debug(
    { logCode: 'stats_audio_monitor' },
    'Starting to monitor audio connection'
  );

  collect(conn, (result) => {
    const event = new CustomEvent('audiostats', { detail: result });
    window.dispatchEvent(event);
  });
};

export {
  monitorAudioConnection,
};
