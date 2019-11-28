import NetworkInformation from '/imports/api/network-information';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import LocalSettings from '/imports/api/local-settings';
import logger from '/imports/startup/client/logger';
import _ from 'lodash';

const NETWORK_MONITORING_CONFIG = Meteor.settings.public.networkMonitoring;

const PACKET_LOST_THRESHOLD = NETWORK_MONITORING_CONFIG.packetLostThreshold;

const NetworkInformationLocal = new Mongo.Collection(null);

const NAVIGATOR_CONNECTION = 'NAVIGATOR_CONNECTION';
const NUMBER_OF_WEBCAMS_CHANGED = 'NUMBER_OF_WEBCAMS_CHANGED';
const STARTED_WEBCAM_SHARING = 'STARTED_WEBCAM_SHARING';
const STOPPED_WEBCAM_SHARING = 'STOPPED_WEBCAM_SHARING';
const WEBCAMS_GET_STATUS = 'WEBCAMS_GET_STATUS';

const DANGER_BEGIN_TIME = 5000;
const DANGER_END_TIME = 30000;

const WARNING_END_TIME = 60000;

let monitoringIntervalRef;

export const updateCurrentWebcamsConnection = (connections) => {
  const doc = {
    timestamp: new Date().getTime(),
    event: NUMBER_OF_WEBCAMS_CHANGED,
    payload: Object.keys(connections),
  };

  NetworkInformationLocal.insert(doc);
};

export const deleteWebcamConnection = (id) => {
  const doc = {
    timestamp: new Date().getTime(),
    event: STOPPED_WEBCAM_SHARING,
    payload: { id },
  };

  NetworkInformationLocal.insert(doc);
};

export const getCurrentWebcams = () => NetworkInformationLocal
  .findOne({
    event: NUMBER_OF_WEBCAMS_CHANGED,
  }, { sort: { timestamp: -1 } });

export const newWebcamConnection = (id) => {
  const doc = {
    timestamp: new Date().getTime(),
    event: STARTED_WEBCAM_SHARING,
    payload: { id },
  };

  NetworkInformationLocal.insert(doc);
};

export const startBandwidthMonitoring = () => {
  monitoringIntervalRef = setInterval(() => {
    const monitoringTime = new Date().getTime();

    const dangerLowerBoundary = monitoringTime - DANGER_BEGIN_TIME;

    const warningLowerBoundary = monitoringTime - DANGER_END_TIME;
    const warningUpperBoundary = monitoringTime - WARNING_END_TIME;

    // Remove old documents to reduce the size of the local collection.
    NetworkInformationLocal.remove({
      event: WEBCAMS_GET_STATUS,
      timestamp: { $lt: warningUpperBoundary },
    });

    const usersOnline = Users.find({
      userId: { $ne: Auth.userID },
      connectionStatus: 'online',
    }, { fields: { userId: 1 } }).map(user => user.userId);

    const usersWithViewWebcamsEnabled = LocalSettings.find({
      meetingId: Auth.meetingID,
      'settings.dataSaving.viewParticipantsWebcams': true,
    }, { fields: { userId: 1 } }).map(user => user.userId);

    const usersWatchingWebcams = usersOnline.filter(
      user => usersWithViewWebcamsEnabled.includes(user),
    );

    const warningZone = NetworkInformationLocal
      .find({
        event: WEBCAMS_GET_STATUS,
        timestamp: { $lte: warningLowerBoundary, $gt: warningUpperBoundary },
        $or: [
          {
            'payload.id': Auth.userID,
            'payload.stats.deltaPliCount': { $gt: 0 },
          },
          {
            'payload.id': { $ne: Auth.userID },
            'payload.stats.deltaPacketsLost': { $gt: PACKET_LOST_THRESHOLD },
          },
        ],
      }).count();

    const warningZoneReceivers = NetworkInformation
      .find({
        receiver: { $in: usersWatchingWebcams },
        sender: Auth.userID,
        time: { $lte: warningLowerBoundary, $gt: warningUpperBoundary },
      }).count();

    const dangerZone = _.uniqBy(NetworkInformationLocal
      .find({
        event: WEBCAMS_GET_STATUS,
        timestamp: { $lt: dangerLowerBoundary, $gte: warningLowerBoundary },
        $or: [
          {
            'payload.id': Auth.userID,
            'payload.stats.deltaPliCount': { $gt: 0 },
          },
          {
            'payload.id': { $ne: Auth.userID },
            'payload.stats.deltaPacketsLost': { $gt: PACKET_LOST_THRESHOLD },
          },
        ],
      }).fetch(), 'payload.id').length;

    const dangerZoneReceivers = _.uniqBy(NetworkInformation
      .find({
        receiver: { $in: usersWatchingWebcams },
        sender: Auth.userID,
        time: { $lt: dangerLowerBoundary, $gte: warningLowerBoundary },
      }).fetch(), 'receiver').length;

    let effectiveType = 'good';

    if (dangerZone) {
      if (!dangerZoneReceivers) {
        effectiveType = 'danger';
      }

      if (dangerZoneReceivers === usersWatchingWebcams.length) {
        effectiveType = 'danger';
      }
    } else if (warningZone) {
      if (!warningZoneReceivers) {
        effectiveType = 'warning';
      }

      if (warningZoneReceivers === usersWatchingWebcams.length) {
        effectiveType = 'warning';
      }
    }

    const lastEffectiveConnectionType = Users.findOne({ userId: Auth.userID },
      { fields: { effectiveConnectionType: 1 } });

    if (lastEffectiveConnectionType
      && lastEffectiveConnectionType.effectiveConnectionType !== effectiveType) {
      logger.info({
        logCode: 'user_connection_instability',
        extraInfo: {
          effectiveType,
        },
      }, `User ${Auth.userID} effective connection is now ${effectiveType}`);
      makeCall('setUserEffectiveConnectionType', effectiveType);
    }
  }, 5000);
};

export const stopBandwidthMonitoring = () => {
  clearInterval(monitoringIntervalRef);
};

export const updateNavigatorConnection = ({ effectiveType, downlink, rtt }) => {
  const doc = {
    timestamp: new Date().getTime(),
    event: NAVIGATOR_CONNECTION,
    payload: {
      effectiveType,
      downlink,
      rtt,
    },
  };

  NetworkInformationLocal.insert(doc);
};

export const updateWebcamStats = (id, stats) => {
  if (!stats) return;

  const lastStatus = NetworkInformationLocal
    .findOne(
      { event: WEBCAMS_GET_STATUS, 'payload.id': id },
      { sort: { timestamp: -1 } },
    );

  const { video } = stats;

  const doc = {
    timestamp: new Date().getTime(),
    event: WEBCAMS_GET_STATUS,
    payload: { id, stats: video },
  };

  if (lastStatus) {
    const {
      payload: {
        stats: {
          packetsLost,
          packetsReceived,
          packetsSent,
          pliCount,
        },
      },
    } = lastStatus;
    const normalizedVideo = { ...video };

    normalizedVideo.deltaPacketsLost = video.packetsLost - packetsLost;
    normalizedVideo.deltaPacketsReceived = video.packetsReceived - packetsReceived;
    normalizedVideo.deltaPacketsSent = video.packetsSent - packetsSent;
    normalizedVideo.deltaPliCount = video.pliCount - pliCount;

    doc.payload = {
      id,
      stats: normalizedVideo,
    };

    if (normalizedVideo.deltaPacketsLost > PACKET_LOST_THRESHOLD) {
      makeCall('userInstabilityDetected', id);
    }
  }

  NetworkInformationLocal.insert(doc);
};

export default {
  NetworkInformationLocal,
  updateCurrentWebcamsConnection,
  deleteWebcamConnection,
  getCurrentWebcams,
  newWebcamConnection,
  startBandwidthMonitoring,
  stopBandwidthMonitoring,
  updateNavigatorConnection,
  updateWebcamStats,
};
