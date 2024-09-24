import { defineMessages } from 'react-intl';
import { makeVar } from '@apollo/client';
import Auth from '/imports/ui/services/auth';
import Session from '/imports/ui/services/storage/in-memory';
import { notify } from '/imports/ui/services/notification';
import AudioService from '/imports/ui/components/audio/service';
import ScreenshareService from '/imports/ui/components/screenshare/service';
import VideoService from '/imports/ui/components/video-provider/service';
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

export const NETWORK_MONITORING_INTERVAL_MS = 2000;

export const lastLevel = makeVar();

let monitoringInterval = null;

export const URL_REGEX = new RegExp(/^(http|https):\/\/[^ "]+$/);
export const getHelp = () => {
  const STATS = window.meetingClientSettings.public.stats;

  if (URL_REGEX.test(STATS.help)) return STATS.help;

  return null;
};

export function getStatus(levels, value) {
  const sortedLevels = Object.entries(levels)
    .map((entry) => [entry[0], Number(entry[1])])
    .sort((a, b) => a[1] - b[1]);

  for (let i = 0; i < sortedLevels.length; i += 1) {
    if (value < sortedLevels[i][1]) {
      return i === 0 ? 'normal' : sortedLevels[i - 1][0];
    }
    if (i === sortedLevels.length - 1) {
      return sortedLevels[i][0];
    }
  }

  return sortedLevels[sortedLevels.length - 1][0];
}

export const getStats = () => {
  const STATS = window.meetingClientSettings.public.stats;
  return STATS.level[lastLevel()];
};

export const handleAudioStatsEvent = (event) => {
  const { detail } = event;

  if (detail) {
    const { loss } = detail;

    // The stat provided by this event is the *INBOUND* packet loss fraction
    // calculated manually by using the packetsLost and packetsReceived metrics.
    // It uses a 5 probe wide window - so roughly a 10 seconds period with a 2
    // seconds interval between captures.
    //
    // This metric is DIFFERENT from the one used in the connection status modal
    // (see the network data object in this file). The network data one is an
    // absolute counter of INBOUND packets lost - and it *SHOULD NOT* be used to 
    // determine alert triggers
    connectionStatus.setPacketLossFraction(loss);
    connectionStatus.setPacketLossStatus(
      getStatus(window.meetingClientSettings.public.stats.loss, loss),
    );
  }
};

export const sortLevel = (a, b) => {
  const RTT = window.meetingClientSettings.public.stats.rtt;

  if (!a.lastUnstableStatus && !b.lastUnstableStatus) return 0;
  if (!a.lastUnstableStatus) return 1;
  if (!b.lastUnstableStatus) return -1;

  const rttOfA = RTT[a.lastUnstableStatus];
  const rttOfB = RTT[b.lastUnstableStatus];

  return rttOfB - rttOfA;
};

export const sortOnline = (a, b) => {
  if (!a.user.currentlyInMeeting && b.user.currentlyInMeeting) return 1;
  if (a.user.currentlyInMeeting === b.user.currentlyInMeeting) return 0;
  if (a.user.currentlyInMeeting && !b.user.currentlyInMeeting) return -1;
  return 0;
};

export const isEnabled = () => window.meetingClientSettings.public.stats.enabled;

export const getNotified = () => {
  const notified = Session.getItem('connectionStatusNotified');

  // Since notified can be undefined we need a boolean verification
  return notified === true;
};

export const notification = (level, intl) => {
  const NOTIFICATION = window.meetingClientSettings.public.stats.notification;

  if (!NOTIFICATION[level]) return null;

  // Avoid toast spamming
  const notified = getNotified();
  if (notified) {
    return null;
  }
  Session.setItem('connectionStatusNotified', true);

  if (intl) notify(intl.formatMessage(intlMessages.notification), level, 'warning');
  return null;
};

/**
 * Calculates the jitter buffer average.
 * For more information see:
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcinboundrtpstreamstats-jitterbufferdelay
 * @param {Object} inboundRtpData The RTCInboundRtpStreamStats object retrieved
 *                                in getStats() call.
 * @returns The jitter buffer average in ms
 */
export const calculateJitterBufferAverage = (inboundRtpData) => {
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
export const addExtraInboundNetworkParameters = (data) => {
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
export const getAudioData = async () => {
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
export const getVideoData = async () => {
  const camerasData = await VideoService.getStats() || {};

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
export const getNetworkData = async () => {
  const audio = await getAudioData();

  const video = await getVideoData();

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
export const calculateBitsPerSecond = (currentData, previousData) => {
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
export const calculateBitsPerSecondFromMultipleData = (currentData, previousData) => {
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

export const sortConnectionData = (connectionData) => connectionData
  .sort(sortLevel)
  .sort(sortOnline);

export const stopMonitoringNetwork = () => {
  clearInterval(monitoringInterval);
  monitoringInterval = null;
  // Reset the network data so that we don't show old data by accident if the
  // monitoring is started again later.
  connectionStatus.setNetworkData({
    ready: false,
    audio: {
      audioCurrentUploadRate: 0,
      audioCurrentDownloadRate: 0,
      jitter: 0,
      packetsLost: 0,
      transportStats: {},
    },
    video: {
      videoCurrentUploadRate: 0,
      videoCurrentDownloadRate: 0,
    },
  });
};

/**
   * Start monitoring the network data.
   * @return {Promise} A Promise that resolves when process started.
   */
export async function startMonitoringNetwork() {
  // Reset the monitoring interval if it's already running
  if (monitoringInterval) stopMonitoringNetwork();

  let previousData = await getNetworkData();

  monitoringInterval = setInterval(async () => {
    const data = await getNetworkData();

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
      ready: true,
      user,
      audio,
      video,
    };

    previousData = data;

    connectionStatus.setNetworkData(networkData);
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
  startMonitoringNetwork,
  stopMonitoringNetwork,
  getStatus,
  getWorstStatus,
};
