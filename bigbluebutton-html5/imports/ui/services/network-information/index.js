const NetworkInformationCollection = new Mongo.Collection(null);

const NAVIGATOR_CONNECTION = 'NAVIGATOR_CONNECTION';
const NUMBER_OF_WEBCAMS_CHANGED = 'NUMBER_OF_WEBCAMS_CHANGED';
const STARTED_WEBCAM_SHARING = 'STARTED_WEBCAM_SHARING';
const STOPPED_WEBCAM_SHARING = 'STOPPED_WEBCAM_SHARING';
const WEBCAMS_GET_STATUS = 'WEBCAMS_GET_STATUS';

let monitoringIntervalRef;

export const currentWebcamConnections = (webrtcConnections) => {
  const doc = {
    timestamp: new Date().getTime(),
    event: NUMBER_OF_WEBCAMS_CHANGED,
    payload: Object.keys(webrtcConnections),
  };

  NetworkInformationCollection.insert(doc);
};

export const deleteWebcamConnection = (id) => {
  const doc = {
    timestamp: new Date().getTime(),
    event: STOPPED_WEBCAM_SHARING,
    payload: { id },
  };

  NetworkInformationCollection.insert(doc);
};

export const getCurrentWebcams = () => NetworkInformationCollection
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

  NetworkInformationCollection.insert(doc);
};

export const startBandwidthMonitoring = () => {
  monitoringIntervalRef = setInterval(() => {
    console.log('startBandwidthMonitoring', NetworkInformationCollection.find({}).fetch());
  }, 15000);
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

  NetworkInformationCollection.insert(doc);
};

export const updateWebcamStats = (id, stats) => {
  if (!stats) return;

  const { video } = stats;

  const doc = {
    timestamp: new Date().getTime(),
    event: WEBCAMS_GET_STATUS,
    payload: { id, stats: video },
  };

  NetworkInformationCollection.insert(doc);
};

export default {
  NetworkInformationCollection,
  currentWebcamConnections,
  deleteWebcamConnection,
  getCurrentWebcams,
  newWebcamConnection,
  startBandwidthMonitoring,
  stopBandwidthMonitoring,
  updateNavigatorConnection,
  updateWebcamStats,
};
