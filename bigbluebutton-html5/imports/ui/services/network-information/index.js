import NetworkInformation from '/imports/api/network-information';
import { makeCall } from '/imports/ui/services/api';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';

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

export const newWebcamConnection = (webRtcPeer) => {
  const { userId, peer } = webRtcPeer;
  const { id: mediaStreamId } = peer.getLocalStream();
  const doc = {
    timestamp: new Date().getTime(),
    event: STARTED_WEBCAM_SHARING,
    payload: {
      userId,
      mediaStreamId,
    },
  };

  NetworkInformationLocal.insert(doc);
};

export const startBandwidthMonitoring = () => {
  monitoringIntervalRef = setInterval(() => {
    const monitoringTime = new Date().getTime();

    const dangerLowerBoundary = monitoringTime - DANGER_BEGIN_TIME;

    const warningLowerBoundary = monitoringTime - DANGER_END_TIME;
    const warningUpperBoundary = monitoringTime - WARNING_END_TIME;

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
            'payload.stats.deltaPacketsLost': { $gt: 0 },
          },
        ],
      }).count();

    const warningZoneReceivers = NetworkInformation
      .find({
        sender: Auth.userID,
        time: { $lte: warningLowerBoundary, $gt: warningUpperBoundary },
      }).count();

    const dangerZone = NetworkInformationLocal
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
            'payload.stats.deltaPacketsLost': { $gt: 0 },
          },
        ],
      }).count();

    const dangerZoneReceivers = NetworkInformation
      .find({
        sender: Auth.userID,
        time: { $lt: dangerLowerBoundary, $gte: warningLowerBoundary },
      }).count();

    let effectiveType = 'good';

    if (dangerZone) {
      if (!dangerZoneReceivers) {
        effectiveType = 'danger';
      }
    } else if (warningZone) {
      if (!warningZoneReceivers) {
        effectiveType = 'warning';
      }
    }

    const lastEffectiveConnectionType = Users.findOne({ userId: Auth.userID });

    if (lastEffectiveConnectionType
      && lastEffectiveConnectionType.effectiveConnectionType !== effectiveType) {
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

    if (normalizedVideo.deltaPacketsLost > 0) {
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
