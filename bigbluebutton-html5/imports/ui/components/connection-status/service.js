import { defineMessages } from 'react-intl';
import { makeVar } from '@apollo/client';
import Auth from '/imports/ui/services/auth';
import Session from '/imports/ui/services/storage/in-memory';
import { notify } from '/imports/ui/services/notification';
import AudioService from '/imports/ui/components/audio/service';
import ScreenshareService from '/imports/ui/components/screenshare/service';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';

const intlMessages = defineMessages({
  saved: {
    id: 'app.settings.save-notification.label',
    description: 'Label shown in toast when data savings are saved',
  },
  notification: {
    id: 'app.connection-status.notification',
    description: 'Label shown in toast when connection loss is detected',
  },
});

const NETWORK_MONITORING_INTERVAL_MS = 2000;

const lastLevel = makeVar();

let statsTimeout = null;

const URL_REGEX = new RegExp(/^(http|https):\/\/[^ "]+$/);
const getHelp = () => {
  const STATS = window.meetingClientSettings.public.stats;

  if (URL_REGEX.test(STATS.help)) return STATS.help;

  return null;
};

const getStats = () => {
  const STATS = window.meetingClientSettings.public.stats;
  return STATS.level[lastLevel()];
};

const setStats = (level = -1, type = 'recovery', value = {}) => {
  if (lastLevel() !== level) {
    lastLevel(level);
  }
};

const handleAudioStatsEvent = (event) => {
  const STATS = window.meetingClientSettings.public.stats;

  const { detail } = event;
  if (detail) {
    const { loss, jitter } = detail;
    let active = false;
    // From higher to lower
    for (let i = STATS.level.length - 1; i >= 0; i--) {
      if (loss >= STATS.loss[i] || jitter >= STATS.jitter[i]) {
        active = true;
        setStats(i, 'audio', { loss, jitter });
        break;
      }
    }

    if (active) startStatsTimeout();
  }
};

const startStatsTimeout = () => {
  const STATS = window.meetingClientSettings.public.stats;

  if (statsTimeout !== null) clearTimeout(statsTimeout);

  statsTimeout = setTimeout(() => {
    setStats(-1, 'recovery', {});
  }, STATS.timeout);
};

const sortLevel = (a, b) => {
  const STATS = window.meetingClientSettings.public.stats;

  const indexOfA = STATS.level.indexOf(a.level);
  const indexOfB = STATS.level.indexOf(b.level);

  if (indexOfA < indexOfB) return 1;
  if (indexOfA === indexOfB) return 0;
  if (indexOfA > indexOfB) return -1;
};

const sortOnline = (a, b) => {
  if (!a.user.isOnline && b.user.isOnline) return 1;
  if (a.user.isOnline === b.user.isOnline) return 0;
  if (a.user.isOnline && !b.user.isOnline) return -1;
};

const isEnabled = () => window.meetingClientSettings.public.stats.enabled;

const getNotified = () => {
  const notified = Session.getItem('connectionStatusNotified');

  // Since notified can be undefined we need a boolean verification
  return notified === true;
};

const notification = (level, intl) => {
  const NOTIFICATION = window.meetingClientSettings.public.stats.notification;

  if (!NOTIFICATION[level]) return null;

  // Avoid toast spamming
  const notified = getNotified();
  if (notified) {
    return null;
  }
  Session.setItem('connectionStatusNotified', true);

  if (intl) notify(intl.formatMessage(intlMessages.notification), level, 'warning');
};

/**
 * Calculates the jitter buffer average.
 * For more information see:
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcinboundrtpstreamstats-jitterbufferdelay
 * @param {Object} inboundRtpData The RTCInboundRtpStreamStats object retrieved
 *                                in getStats() call.
 * @returns The jitter buffer average in ms
 */
const calculateJitterBufferAverage = (inboundRtpData) => {
  if (!inboundRtpData) return 0;

  const {
    jitterBufferDelay,
    jitterBufferEmittedCount,
  } = inboundRtpData;

  if (!jitterBufferDelay || !jitterBufferEmittedCount) return '--';

  return Math.round((jitterBufferDelay / jitterBufferEmittedCount) * 1000);
};

/**
 * Given the data returned from getStats(), returns an array containing all the
 * the stats of the given type.
 * For more information see:
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
 * and
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsType
 * @param {Object} data - RTCStatsReport object returned from getStats() API
 * @param {String} type - The string type corresponding to RTCStatsType object
 * @returns {Array[Object]} An array containing all occurrences of the given
 *                          type in the data Object.
 */
const getDataType = (data, type) => {
  if (!data || typeof data !== 'object' || !type) return [];

  return Object.values(data).filter((stat) => stat.type === type);
};

/**
 * Returns a new Object containing extra parameters calculated from inbound
 * data. The input data is also appended in the returned Object.
 * @param {Object} currentData - The object returned from getStats / service's
 *                               getNetworkData()
 * @returns {Object} the currentData object with the extra inbound network
 *                    added to it.
 */
const addExtraInboundNetworkParameters = (data) => {
  if (!data) return data;

  const inboundRtpData = getDataType(data, 'inbound-rtp')[0];

  if (!inboundRtpData) return data;

  const extraParameters = {
    jitterBufferAverage: calculateJitterBufferAverage(inboundRtpData),
    packetsLost: inboundRtpData.packetsLost,
  };

  return Object.assign(inboundRtpData, extraParameters);
};

/**
 * Retrieves the inbound and outbound data using WebRTC getStats API, for audio.
 * @returns An Object with format (property:type) :
 *   {
 *     transportStats: Object,
 *     inbound-rtp: RTCInboundRtpStreamStats,
 *     outbound-rtp: RTCOutboundRtpStreamStats,
 *   }
 * For more information see:
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcinboundrtpstreamstats
 * and
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcoutboundrtpstreamstats
 */
const getAudioData = async () => {
  const data = await AudioService.getStats();

  if (!data) return {};

  addExtraInboundNetworkParameters(data);

  return data;
};

/**
 * Retrieves the inbound and outbound data using WebRTC getStats API, for video.
 * The video stats contains the stats about all video peers (cameras) and
 * for screenshare peer appended into one single object, containing the id
 * of the peers with it's stats information.
 * @returns An Object containing video data for all video peers and screenshare
 *          peer
 */
const getVideoData = async (getVideoStreamsStats) => {
  const camerasData = await getVideoStreamsStats() || {};

  const screenshareData = await ScreenshareService.getStats() || {};

  return {
    ...camerasData,
    ...screenshareData,
  };
};

/**
 * Get the user, audio and video data from current active streams.
 * For audio, this will get information about the mic/listen-only stream.
 * @returns An Object containing all this data.
 */
const getNetworkData = async (getVideoStreamsStats) => {
  const audio = await getAudioData();

  const video = await getVideoData(getVideoStreamsStats);

  const user = {
    time: new Date(),
    username: Auth.username,
    meeting_name: Auth.confname,
    meeting_id: Auth.meetingID,
    connection_id: Auth.connectionID,
    user_id: Auth.userID,
    extern_user_id: Auth.externUserID,
  };

  const fullData = {
    user,
    audio,
    video,
  };

  return fullData;
};

/**
 * Calculates both upload and download rates using data retrieved from getStats
 * API. For upload (outbound-rtp) we use both bytesSent and timestamp fields.
 * byteSent field contains the number of octets sent at the given timestamp,
 * more information can be found in:
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcsentrtpstreamstats-bytessent
 *
 * timestamp is given in millisseconds, more information can be found in:
 * https://www.w3.org/TR/webrtc-stats/#webidl-1049090475
 * @param {Object} currentData - The object returned from getStats / service's
 *                               getNetworkData()
 * @param {Object} previousData - The same object as above, but representing
 *                               a data collected in past (previous call of
 *                               service's getNetworkData())
 * @returns An object of numbers, containing both outbound (upload) and inbound
 *          (download) rates (kbps).
 */
const calculateBitsPerSecond = (currentData, previousData) => {
  const result = {
    outbound: 0,
    inbound: 0,
  };

  if (!currentData || !previousData) return result;

  const currentOutboundData = getDataType(currentData, 'outbound-rtp')[0];
  const currentInboundData = getDataType(currentData, 'inbound-rtp')[0];
  const previousOutboundData = getDataType(previousData, 'outbound-rtp')[0];
  const previousInboundData = getDataType(previousData, 'inbound-rtp')[0];

  if (currentOutboundData && previousOutboundData) {
    const {
      bytesSent: outboundBytesSent,
      timestamp: outboundTimestamp,
    } = currentOutboundData;

    let {
      headerBytesSent: outboundHeaderBytesSent,
    } = currentOutboundData;

    if (!outboundHeaderBytesSent) outboundHeaderBytesSent = 0;

    const {
      bytesSent: previousOutboundBytesSent,
      timestamp: previousOutboundTimestamp,
    } = previousOutboundData;

    let {
      headerBytesSent: previousOutboundHeaderBytesSent,
    } = previousOutboundData;

    if (!previousOutboundHeaderBytesSent) previousOutboundHeaderBytesSent = 0;

    const outboundBytesPerSecond = (outboundBytesSent + outboundHeaderBytesSent
      - previousOutboundBytesSent - previousOutboundHeaderBytesSent)
      / (outboundTimestamp - previousOutboundTimestamp);

    result.outbound = Math.round((outboundBytesPerSecond * 8 * 1000) / 1024);
  }

  if (currentInboundData && previousInboundData) {
    const {
      bytesReceived: inboundBytesReceived,
      timestamp: inboundTimestamp,
    } = currentInboundData;

    let {
      headerBytesReceived: inboundHeaderBytesReceived,
    } = currentInboundData;

    if (!inboundHeaderBytesReceived) inboundHeaderBytesReceived = 0;

    const {
      bytesReceived: previousInboundBytesReceived,
      timestamp: previousInboundTimestamp,
    } = previousInboundData;

    let {
      headerBytesReceived: previousInboundHeaderBytesReceived,
    } = previousInboundData;

    if (!previousInboundHeaderBytesReceived) {
      previousInboundHeaderBytesReceived = 0;
    }

    const inboundBytesPerSecond = (inboundBytesReceived
      + inboundHeaderBytesReceived - previousInboundBytesReceived
      - previousInboundHeaderBytesReceived) / (inboundTimestamp
        - previousInboundTimestamp);

    result.inbound = Math.round((inboundBytesPerSecond * 8 * 1000) / 1024);
  }

  return result;
};

/**
 * Similar to calculateBitsPerSecond, but it receives stats from multiple
 * peers. The total inbound/outbound is the sum of all peers.
 * @param {Object} currentData - The Object returned from
 *                               getStats / service's getNetworkData()
 * @param {Object} previousData - The same object as above, but
 *                                representing a data collected in past
 *                                (previous call of service's getNetworkData())
 */
const calculateBitsPerSecondFromMultipleData = (currentData, previousData) => {
  const result = {
    outbound: 0,
    inbound: 0,
  };

  if (!currentData || !previousData) return result;

  Object.keys(currentData).forEach((peerId) => {
    if (previousData[peerId]) {
      const {
        outbound: peerOutbound,
        inbound: peerInbound,
      } = calculateBitsPerSecond(currentData[peerId], previousData[peerId]);

      result.outbound += peerOutbound;
      result.inbound += peerInbound;
    }
  });

  return result;
};

const sortConnectionData = (connectionData) => connectionData.sort(sortLevel).sort(sortOnline);

export function getStatus(levels, value) {
  const sortedLevels = Object.keys(levels)
    .map(Number)
    .sort((a, b) => a - b);
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < sortedLevels.length; i++) {
    if (value < sortedLevels[i]) {
      return i === 0 ? 'normal' : levels[sortedLevels[i - 1]];
    }
    if (i === sortedLevels.length - 1) {
      return levels[sortedLevels[i]];
    }
  }

  return levels[sortedLevels[sortedLevels.length - 1]];
}

/**
   * Start monitoring the network data.
   * @return {Promise} A Promise that resolves when process started.
   */
export async function startMonitoringNetwork(getVideoStreamsStats) {
  let previousData = await getNetworkData(getVideoStreamsStats);

  setInterval(async () => {
    const data = await getNetworkData(getVideoStreamsStats);

    const {
      outbound: audioCurrentUploadRate,
      inbound: audioCurrentDownloadRate,
    } = calculateBitsPerSecond(data.audio, previousData.audio);

    const inboundRtp = getDataType(data.audio, 'inbound-rtp')[0];

    const jitter = inboundRtp
      ? inboundRtp.jitterBufferAverage
      : 0;

    const packetsLost = inboundRtp
      ? inboundRtp.packetsLost
      : 0;

    const audio = {
      audioCurrentUploadRate,
      audioCurrentDownloadRate,
      jitter,
      packetsLost,
      transportStats: data.audio.transportStats,
    };

    const {
      outbound: videoCurrentUploadRate,
      inbound: videoCurrentDownloadRate,
    } = calculateBitsPerSecondFromMultipleData(data.video,
      previousData.video);

    const video = {
      videoCurrentUploadRate,
      videoCurrentDownloadRate,
    };

    const { user } = data;

    const networkData = {
      user,
      audio,
      video,
    };

    previousData = data;

    connectionStatus.setNetworkData(networkData);
    connectionStatus
      .setJitterStatus(getStatus(window.meetingClientSettings.public.stats.jitter, jitter));

    connectionStatus
      .setPacketLossStatus(getStatus(window.meetingClientSettings.public.stats.loss, packetsLost));
  }, NETWORK_MONITORING_INTERVAL_MS);
}

export function getWorstStatus(statuses) {
  const statusOrder = {
    normal: 0,
    warning: 1,
    danger: 2,
    critical: 3,
  };

  let worstStatus = 'normal';
  // eslint-disable-next-line
  for (let status of statuses) {
    if (statusOrder[status] > statusOrder[worstStatus]) {
      worstStatus = status;
    }
  }

  return worstStatus;
}

export default {
  getStats,
  getHelp,
  isEnabled,
  notification,
  getNetworkData,
  calculateBitsPerSecond,
  calculateBitsPerSecondFromMultipleData,
  getDataType,
  sortConnectionData,
  handleAudioStatsEvent,
  startMonitoringNetwork,
  getStatus,
  getWorstStatus,
};
