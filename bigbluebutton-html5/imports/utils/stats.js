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
 * Get the info about candidate-pair that is being used by the current peer.
 * For firefox, or any other browser that doesn't support iceTransport
 * property of RTCDtlsTransport, we retrieve the selected local candidate
 * by looking into stats returned from getStats() api. For other browsers,
 * we should use getSelectedCandidatePairFromPeer instead, because it has
 * relatedAddress and relatedPort information about local candidate.
 *
 * @param {Object} stats object returned by getStats() api
 * @returns An Object of type RTCIceCandidatePairStats containing information
 *          about the candidate-pair being used by the peer.
 *
 * For firefox, we can use the 'selected' flag to find the candidate pair
 * being used, while in chrome we can retrieved the selected pair
 * by looking for the corresponding transport of the active peer.
 * For more information see:
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatepairstats
 * and
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidatePairStats/selected#value
 */
const getSelectedCandidatePairFromStats = (stats) => {
  if (!stats || typeof stats !== 'object') return null;

  const transport = Object.values(stats).find((stat) => stat.type === 'transport') || {};

  return Object.values(stats).find((stat) => stat.type === 'candidate-pair'
    && stat.nominated
    && (stat.selected || stat.id === transport.selectedCandidatePairId));
};

/**
 * Get the info about candidate-pair that is being used by the current peer.
 * This function's return value (RTCIceCandidatePair object ) is different
 * from getSelectedCandidatePairFromStats (RTCIceCandidatePairStats object).
 * The information returned here contains the relatedAddress and relatedPort
 * fields (only for candidates that are derived from another candidate, for
 * host candidates, these fields are null). These field can be helpful for
 * debugging network issues. For all the browsers that support iceTransport
 * field of RTCDtlsTransport, we use this function as default to retrieve
 * information about current selected-pair. For other browsers we retrieve it
 * from getSelectedCandidatePairFromStats
 *
 * @returns {Object} An RTCIceCandidatePair represented the selected
 *                   candidate-pair of the active peer.
 *
 * For more info see:
 * https://www.w3.org/TR/webrtc/#dom-rtcicecandidatepair
 * and
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCIceCandidatePair
 * and
 * https://developer.mozilla.org/en-US/docs/Web/API/RTCDtlsTransport
 */
const getSelectedCandidatePairFromPeer = (peer) => {
  if (!peer) return null;

  let selectedPair = null;

  const receivers = peer.getReceivers();
  if (receivers
    && receivers[0]
    && receivers[0]?.transport?.iceTransport
    && typeof receivers[0].transport.iceTransport.getSelectedCandidatePair === 'function') {
    selectedPair = receivers[0].transport.iceTransport.getSelectedCandidatePair();
  }

  return selectedPair;
};

/**
 * Gets the selected candidates (local and remote) information.
 * For browsers that support iceTransport property (see
 * getSelectedCandidatePairFromPeer) we get this info from peer, otherwise
 * we retrieve this information from getStats() api
 *
 * @param {Object}   An object {peer?, stats?} containing the peer connection
 *                   object and/or the stats
 * @returns {Object} An Object {local, remote} containing the information about
 *                   the selected candidates. For browsers that support the
 *                   iceTransport property, the object attribute's type is RTCIceCandidate.
 *                   A RTCIceCandidateStats is returned, otherwise.
 *
 * For more info see:
 * https://www.w3.org/TR/webrtc/#dom-rtcicecandidate
 * and
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatestats
 *
 */
const getSelectedCandidates = ({ peer, stats }) => {
  let selectedPair = getSelectedCandidatePairFromPeer(peer);

  if (selectedPair) return selectedPair;

  if (!stats) return null;

  selectedPair = getSelectedCandidatePairFromStats(stats);

  if (selectedPair) {
    return {
      local: stats[selectedPair?.localCandidateId],
      remote: stats[selectedPair?.remoteCandidateId],
    };
  }

  return null;
};

/**
 * Gets the information about private/public ip address from peer
 * stats. The information retrieved from selected pair from the current
 * RTCIceTransport and returned in a new Object with format:
 * {
 *   isUsingTurn: Boolean,
 *   address: String,
 *   relatedAddress: String,
 *   port: Number,
 *   relatedPort: Number,
 *   protocol: String,
 *   candidateType: String,
 *   ufrag: String,
 *   remoteAddress: String,
 *   remotePort: Number,
 *   remoteCandidateType: String,
 *   remoteProtocol: String,
 *   remoteUfrag: String,
 *   dtlsRole: String,
 *   dtlsState: String,
 *   iceRole: String,
 *   iceState: String,
 *   selectedCandidatePairChanges: Number
 *   relayProtocol: String
 * }
 *
 * If users isn't behind NAT, relatedAddress and relatedPort may be null.
 *
 * @returns An Object containing the information about the peer's transport.
 *
 * For more information see:
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatepairstats
 * and
 * https://www.w3.org/TR/webrtc-stats/#dom-rtcicecandidatestats
 * and
 * https://www.w3.org/TR/webrtc/#rtcicecandidatetype-enum
 */
const getTransportStats = async (peer, stats) => {
  let transports = {};

  if (stats) {
    const selectedCandidates = getSelectedCandidates({ peer, stats }) || {};
    const {
      local: selectedLocalCandidate = {},
      remote: selectedRemoteCandidate = {},
    } = selectedCandidates;
    const candidateType = selectedLocalCandidate?.candidateType || selectedLocalCandidate?.type;
    const remoteCandidateType = selectedRemoteCandidate?.candidateType
      || selectedRemoteCandidate?.type;
    const isUsingTurn = candidateType ? candidateType === 'relay' : null;
    // 1 transport per peer connection - we can safely get the first one
    const transportData = getDataType(stats, 'transport')[0];

    transports = {
      isUsingTurn,
      address: selectedLocalCandidate?.address,
      relatedAddress: selectedLocalCandidate?.relatedAddress,
      port: selectedLocalCandidate?.port,
      relatedPort: selectedLocalCandidate?.relatedPort,
      protocol: selectedLocalCandidate?.protocol,
      candidateType,
      ufrag: selectedLocalCandidate?.usernameFragment,
      remoteAddress: selectedRemoteCandidate?.address,
      remotePort: selectedRemoteCandidate?.port,
      remoteCandidateType,
      remoteProtocol: selectedRemoteCandidate?.protocol,
      remoteUfrag: selectedRemoteCandidate?.usernameFragment,
      dtlsRole: transportData?.dtlsRole,
      dtlsState: transportData?.dtlsState,
      iceRole: transportData?.iceRole,
      iceState: transportData?.iceState,
      selectedCandidatePairChanges: transportData?.selectedCandidatePairChanges,

    };

    if (isUsingTurn) transports.relayProtocol = selectedLocalCandidate.relayProtocol;
  }

  return transports;
};

const buildInboundRtpData = (inbound) => {
  if (!inbound) return {};

  const inboundRtp = {
    kind: inbound.kind,
    jitterBufferAverage: inbound.jitterBufferAverage,
    lastPacketReceivedTimestamp: inbound.lastPacketReceivedTimestamp,
    packetsLost: inbound.packetsLost,
    packetsReceived: inbound.packetsReceived,
    packetsDiscarded: inbound.packetsDiscarded,
  };

  if (inbound.kind === 'audio') {
    inboundRtp.totalAudioEnergy = inbound.totalAudioEnergy;
  } else if (inbound.kind === 'video') {
    inboundRtp.framesDecoded = inbound.framesDecoded;
    inboundRtp.framesDropped = inbound.framesDropped;
    inboundRtp.framesReceived = inbound.framesReceived;
    inboundRtp.hugeFramesSent = inbound.hugeFramesSent;
    inboundRtp.keyFramesDecoded = inbound.keyFramesDecoded;
    inboundRtp.keyFramesReceived = inbound.keyFramesReceived;
    inboundRtp.totalDecodeTime = inbound.totalDecodeTime;
    inboundRtp.totalInterFrameDelay = inbound.totalInterFrameDelay;
    inboundRtp.totalSquaredInterFrameDelay = inbound.totalSquaredInterFrameDelay;
  }

  return inboundRtp;
};

const buildOutboundRtpData = (outbound) => {
  if (!outbound) return {};

  const outboundRtp = {
    kind: outbound.kind,
    packetsSent: outbound.packetsSent,
    nackCount: outbound.nackCount,
    targetBitrate: outbound.targetBitrate,
    totalPacketSendDelay: outbound.totalPacketSendDelay,
  };

  if (outbound.kind === 'audio') {
    outboundRtp.totalAudioEnergy = outbound.totalAudioEnergy;
  } else if (outbound.kind === 'video') {
    outboundRtp.framesEncoded = outbound.framesEncoded;
    outboundRtp.framesSent = outbound.framesSent;
    outboundRtp.hugeFramesSent = outbound.hugeFramesSent;
    outboundRtp.keyFramesEncoded = outbound.keyFramesEncoded;
    outboundRtp.totalEncodeTime = outbound.totalEncodeTime;
    outboundRtp.totalPacketSendDelay = outbound.totalPacketSendDelay;
    outboundRtp.firCount = outbound.firCount;
    outboundRtp.pliCount = outbound.pliCount;
    outboundRtp.nackCount = outbound.nackCount;
    outboundRtp.qpsFE = outbound.qpSum / outbound.framesEncoded;
  }

  return outboundRtp;
};

const getRTCStatsLogMetadata = (stats) => {
  if (!stats) return {};

  const { transportStats = {} } = stats;

  addExtraInboundNetworkParameters(stats);
  const selectedPair = getSelectedCandidatePairFromStats(stats);
  const inbound = getDataType(stats, 'inbound-rtp')[0];
  const outbound = getDataType(stats, 'outbound-rtp')[0];

  return {
    inboundRtp: buildInboundRtpData(inbound),
    outbound: buildOutboundRtpData(outbound),
    selectedPair: {
      state: selectedPair?.state,
      nominated: selectedPair?.nominated,
      totalRoundTripTime: selectedPair?.totalRoundTripTime,
      requestsSent: selectedPair?.requestsSent,
      responsesReceived: selectedPair?.responsesReceived,
      availableOutgoingBitrate: selectedPair?.availableOutgoingBitrate,
      availableIncomingBitrate: selectedPair?.availableIncomingBitrate,
      lastPacketSentTimestamp: selectedPair?.lastPacketSentTimestamp,
      lastPacketReceivedTimestamp: selectedPair?.lastPacketReceivedTimestamp,
    },
    transport: transportStats,
  };
};

export {
  addExtraInboundNetworkParameters,
  calculateJitterBufferAverage,
  getDataType,
  getTransportStats,
  getSelectedCandidates,
  getSelectedCandidatePairFromPeer,
  getSelectedCandidatePairFromStats,
  getRTCStatsLogMetadata,
};
