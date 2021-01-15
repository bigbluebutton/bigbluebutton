import logger from '/imports/startup/client/logger';
import BaseBroker from '/imports/ui/services/bbb-webrtc-sfu/sfu-base-broker';

const ON_ICE_CANDIDATE_MSG = 'iceCandidate';
const SFU_COMPONENT_NAME = 'audio';

class ListenOnlyBroker extends BaseBroker {
  constructor(
    wsUrl,
    voiceBridge,
    userId,
    internalMeetingId,
    role,
    options = {},
  ) {
    super(SFU_COMPONENT_NAME, wsUrl);
    this.voiceBridge = voiceBridge;
    this.userId = userId;
    this.internalMeetingId = internalMeetingId;
    this.role = role;

    // Optional parameters are: userName, caleeName, iceServers
    Object.assign(this, options);
  }

  joinListenOnly () {
    return new Promise((resolve, reject) => {
      const options = {
        mediaConstraints: {
          audio: true,
          video: false,
        },
        onicecandidate: (candidate) => {
          this.onIceCandidate(candidate, this.role);
        },
      };

      this.addIceServers(options);

      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly(options, (error) => {
        if (error) {
          // 1305: "PEER_NEGOTIATION_FAILED",
          const normalizedError = BaseBroker.assembleError(1305);
          logger.error({
            logCode: `${this.logCodePrefix}_peer_creation_failed`,
            extraInfo: {
              errorMessage: error.name || error.message || 'Unknown error',
              errorCode: normalizedError.errorCode,
              sfuComponent: this.sfuComponent,
              started: this.started,
            },
          }, `Listen only peer creation failed`);
          this.onerror(normalizedError);
          return reject(normalizedError);
        }

        this.webRtcPeer.iceQueue = [];
        this.webRtcPeer.generateOffer(this.onOfferGenerated.bind(this));
      });

      this.webRtcPeer.peerConnection.onconnectionstatechange = this.handleConnectionStateChange.bind(this);
      return resolve();
    });
  }

  listen () {
    return this.openWSConnection()
      .then(this.joinListenOnly.bind(this));
  }

  onWSMessage (message) {
    const parsedMessage = JSON.parse(message.data);

    switch (parsedMessage.id) {
      case 'startResponse':
        this.processAnswer(parsedMessage);
        break;
      case 'iceCandidate':
        this.handleIceCandidate(parsedMessage.candidate);
        break;
      case 'webRTCAudioSuccess':
        this.onstart(parsedMessage.success);
        this.started = true;
        break;
      case 'webRTCAudioError':
      case 'error':
        this.handleSFUError(parsedMessage);
        break;
      case 'pong':
        break;
      default:
        logger.debug({
          logCode: `${this.logCodePrefix}_invalid_req`,
          extraInfo: { messageId: parsedMessage.id || 'Unknown', sfuComponent: this.sfuComponent }
        }, `Discarded invalid SFU message`);
    }
  }

  handleSFUError (sfuResponse) {
    const { code, reason, role } = sfuResponse;
    const error = BaseBroker.assembleError(code, reason);

    logger.error({
      logCode: `${this.logCodePrefix}_sfu_error`,
      extraInfo: {
        errorCode: code,
        errorMessage: error.errorMessage,
        role,
        sfuComponent: this.sfuComponent,
        started: this.started,
      },
    }, `Listen only failed in SFU`);
    this.onerror(error);
  }

  onOfferGenerated (error, sdpOffer) {
    if (error) {
      logger.error({
        logCode: `${this.logCodePrefix}_offer_failure`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          sfuComponent: this.sfuComponent
        },
      }, `Listen only offer generation failed`);
      // 1305: "PEER_NEGOTIATION_FAILED",
      const normalizedError = BaseBroker.assembleError(1305);
      return this.onerror(error);
    }

    const message = {
      id: 'start',
      type: this.sfuComponent,
      role: this.role,
      internalMeetingId: this.internalMeetingId,
      voiceBridge: this.voiceBridge,
      caleeName: this.caleeName,
      userId: this.userId,
      userName: this.userName,
      sdpOffer,
    };

    logger.debug({
      logCode: `${this.logCodePrefix}_offer_generated`,
      extraInfo: { sfuComponent: this.sfuComponent, role: this.role },
    }, `SFU audio offer generated`);

    this.sendMessage(message);
  }

  onIceCandidate (candidate, role) {
    const message = {
      id: ON_ICE_CANDIDATE_MSG,
      role,
      type: this.sfuComponent,
      voiceBridge: this.voiceBridge,
      candidate,
    };

    this.sendMessage(message);
  }
}

export default ListenOnlyBroker;
