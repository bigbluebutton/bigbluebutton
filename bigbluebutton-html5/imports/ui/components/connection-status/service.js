import { defineMessages } from 'react-intl';
import Session from '/imports/ui/services/storage/in-memory';
import { notify } from '/imports/ui/services/notification';
import getStatus from '../../core/utils/getStatus';
import { getDataType } from '/imports/utils/stats';

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

export const URL_REGEX = new RegExp(/^(http|https):\/\/[^ "]+$/);
export const getHelp = () => {
  const STATS = window.meetingClientSettings.public.stats;

  if (URL_REGEX.test(STATS.help)) return STATS.help;

  return null;
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
  getHelp,
  isEnabled,
  notification,
  calculateBitsPerSecond,
  calculateBitsPerSecondFromMultipleData,
  getDataType,
  sortConnectionData,
  getStatus,
  getWorstStatus,
};
