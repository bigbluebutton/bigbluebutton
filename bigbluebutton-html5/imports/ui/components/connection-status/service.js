import { defineMessages } from 'react-intl';
import ConnectionStatus from '/imports/api/connection-status';
import Users from '/imports/api/users';
import UsersPersistentData from '/imports/api/users-persistent-data';
import Auth from '/imports/ui/services/auth';
import Settings from '/imports/ui/services/settings';
import _ from 'lodash';
import { Session } from 'meteor/session';
import { notify } from '/imports/ui/services/notification';
import { makeCall } from '/imports/ui/services/api';
import AudioService from '/imports/ui/components/audio/service';
import VideoService from '/imports/ui/components/video-provider/service';
import ScreenshareService from '/imports/ui/components/screenshare/service';

const STATS = Meteor.settings.public.stats;
const NOTIFICATION = STATS.notification;
const STATS_INTERVAL = STATS.interval;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

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

let stats = -1;
let lastRtt = null;
const statsDep = new Tracker.Dependency();

let statsTimeout = null;

const URL_REGEX = new RegExp(/^(http|https):\/\/[^ "]+$/);
const getHelp = () => {
  if (URL_REGEX.test(STATS.help)) return STATS.help;

  return null;
};

const getStats = () => {
  statsDep.depend();
  return STATS.level[stats];
};

const setStats = (level = -1, type = 'recovery', value = {}) => {
  if (stats !== level) {
    stats = level;
    statsDep.changed();
    addConnectionStatus(level, type, value);
  }
};

const handleStats = (level, type, value) => {
  if (level > stats) {
    setStats(level, type, value);
  }
};

const handleAudioStatsEvent = (event) => {
  const { detail } = event;
  if (detail) {
    const { loss, jitter } = detail;
    let active = false;
    // From higher to lower
    for (let i = STATS.level.length - 1; i >= 0; i--) {
      if (loss >= STATS.loss[i] || jitter >= STATS.jitter[i]) {
        active = true;
        handleStats(i, 'audio', { loss, jitter });
        break;
      }
    }

    if (active) startStatsTimeout();
  }
};

const handleSocketStatsEvent = (event) => {
  const { detail } = event;
  if (detail) {
    const { rtt } = detail;
    let active = false;
    // From higher to lower
    for (let i = STATS.level.length - 1; i >= 0; i--) {
      if (rtt >= STATS.rtt[i]) {
        active = true;
        handleStats(i, 'socket', { rtt });
        break;
      }
    }

    if (active) startStatsTimeout();
  }
};

const startStatsTimeout = () => {
  if (statsTimeout !== null) clearTimeout(statsTimeout);

  statsTimeout = setTimeout(() => {
    setStats();
  }, STATS.timeout);
};

const addConnectionStatus = (level, type, value) => {
  const status = level !== -1 ? STATS.level[level] : 'normal';

  makeCall('addConnectionStatus', status, type, value);
}

const fetchRoundTripTime = () => {
  const t0 = Date.now();
  makeCall('voidConnection', lastRtt).then(() => {
    const tf = Date.now();
    const rtt = tf - t0;
    const event = new CustomEvent('socketstats', { detail: { rtt } });
    window.dispatchEvent(event);
    lastRtt = rtt;
  });
};

const sortLevel = (a, b) => {
  const indexOfA = STATS.level.indexOf(a.level);
  const indexOfB = STATS.level.indexOf(b.level);

  if (indexOfA < indexOfB) return 1;
  if (indexOfA === indexOfB) return 0;
  if (indexOfA > indexOfB) return -1;
};

const sortOffline = (a, b) => {
  if (a.offline && !b.offline) return 1;
  if (a.offline === b.offline) return 0;
  if (!a.offline && b.offline) return -1;
};

const getMyConnectionStatus = () => {
  const myConnectionStatus = ConnectionStatus.findOne(
    {
      meetingId: Auth.meetingID,
      userId: Auth.userID,
    },
    {
      fields:
      {
        level: 1,
        timestamp: 1,
      },
    },
  );

  const me = Users.findOne(
    {
      meetingId: Auth.meetingID,
      userId: Auth.userID,
    },
    {
      fields:
      {
        avatar: 1,
        color: 1,
      },
    },
  );

  if (myConnectionStatus) {
    return [{
      name: Auth.fullname,
      avatar: me.avatar,
      offline: false,
      you: true,
      moderator: false,
      color: me.color,
      level: myConnectionStatus.level,
      timestamp: myConnectionStatus.timestamp,
    }];
  }

  return [];
};

const getConnectionStatus = () => {
  if (!isModerator()) return getMyConnectionStatus();

  const connectionStatus = ConnectionStatus.find(
    { meetingId: Auth.meetingID },
  ).fetch().map((status) => {
    const {
      userId,
      level,
      timestamp,
    } = status;

    return {
      userId,
      level,
      timestamp,
    };
  });

  return UsersPersistentData.find(
    { meetingId: Auth.meetingID },
    {
      fields:
      {
        userId: 1,
        name: 1,
        role: 1,
        avatar: 1,
        color: 1,
        loggedOut: 1,
      },
    },
  ).fetch().reduce((result, user) => {
    const {
      userId,
      name,
      role,
      avatar,
      color,
      loggedOut,
    } = user;

    const status = connectionStatus.find(status => status.userId === userId);

    if (status) {
      result.push({
        name,
        avatar,
        offline: loggedOut,
        you: Auth.userID === userId,
        moderator: role === ROLE_MODERATOR,
        color,
        level: status.level,
        timestamp: status.timestamp,
      });
    }

    return result;
  }, []).sort(sortLevel).sort(sortOffline);
};

const isEnabled = () => STATS.enabled;

let roundTripTimeInterval = null;

const startRoundTripTime = () => {
  if (!isEnabled()) return;

  stopRoundTripTime();

  roundTripTimeInterval = setInterval(fetchRoundTripTime, STATS_INTERVAL);
};

const stopRoundTripTime = () => {
  if (roundTripTimeInterval) {
    clearInterval(roundTripTimeInterval);
  }
};

const isModerator = () => {
  const user = Users.findOne(
    {
      meetingId: Auth.meetingID,
      userId: Auth.userID,
    },
    { fields: { role: 1 } },
  );

  if (user && user.role === ROLE_MODERATOR) {
    return true;
  }

  return false;
};

if (STATS.enabled) {
  window.addEventListener('audiostats', handleAudioStatsEvent);
  window.addEventListener('socketstats', handleSocketStatsEvent);
}

const updateDataSavingSettings = (dataSaving, intl) => {
  if (!_.isEqual(Settings.dataSaving, dataSaving)) {
    Settings.dataSaving = dataSaving;
    Settings.save();
    if (intl) notify(intl.formatMessage(intlMessages.saved), 'info', 'settings');
  }
};

const getNotified = () => {
  const notified = Session.get('connectionStatusNotified');

  // Since notified can be undefined we need a boolean verification
  return notified === true;
};

const notification = (level, intl) => {
  if (!NOTIFICATION[level]) return null;

  // Avoid toast spamming
  const notified = getNotified();
  if (notified) {
    return null;
  }
  Session.set('connectionStatusNotified', true);


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
const getVideoData = async () => {
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
const getNetworkData = async () => {
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
 * Calculates both upload and download rates using data retreived from getStats
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

export default {
  isModerator,
  getConnectionStatus,
  getStats,
  getHelp,
  isEnabled,
  notification,
  startRoundTripTime,
  stopRoundTripTime,
  updateDataSavingSettings,
  getNetworkData,
  calculateBitsPerSecond,
  calculateBitsPerSecondFromMultipleData,
  getDataType,
};
