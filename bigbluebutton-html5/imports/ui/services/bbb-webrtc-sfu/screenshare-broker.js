import logger from '/imports/startup/client/logger';
import BaseBroker from '/imports/ui/services/bbb-webrtc-sfu/sfu-base-broker';

const ON_ICE_CANDIDATE_MSG = 'iceCandidate';
const SFU_COMPONENT_NAME = 'screenshare';

class ScreenshareBroker extends BaseBroker {
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
    this.ws = null;
    this.webRtcPeer = null;
    this.hasAudio = false;

    // Optional parameters are: userName, caleeName, iceServers, hasAudio
    Object.assign(this, options);
  }

  onstreamended () {
    // To be implemented by instantiators
  }

  share () {
    return this.openWSConnection()
      .then(this.startScreensharing.bind(this));
  }

  view () {
    return this.openWSConnection()
      .then(this.subscribeToScreenStream.bind(this));
  }

  onWSMessage (message) {
    const parsedMessage = JSON.parse(message.data);

    switch (parsedMessage.id) {
      case 'startResponse':
        this.processAnswer(parsedMessage);
        break;
      case 'playStart':
        this.onstart();
        this.started = true;
        break;
      case 'stopSharing':
        this.stop();
        break;
      case 'iceCandidate':
        this.handleIceCandidate(parsedMessage.candidate);
        break;
      case 'error':
        this.handleSFUError(parsedMessage);
        break;
      case 'pong':
        break;
      default:
        logger.debug({
          logCode: `${this.logCodePrefix}_invalid_req`,
          extraInfo: {
            messageId: parsedMessage.id || 'Unknown',
            sfuComponent: this.sfuComponent,
            role: this.role,
          }
        }, `Discarded invalid SFU message`);
    }
  }

  handleSFUError (sfuResponse) {
    const { code, reason } = sfuResponse;
    const error = BaseBroker.assembleError(code, reason);

    logger.error({
      logCode: `${this.logCodePrefix}_sfu_error`,
      extraInfo: {
        errorCode: code,
        errorMessage: error.errorMessage,
        role: this.role,
        sfuComponent: this.sfuComponent,
        started: this.started,
      },
    }, `Screen sharing failed in SFU`);
    this.onerror(error);
  }

  onOfferGenerated (error, sdpOffer) {
    if (error) {
      logger.error({
        logCode: `${this.logCodePrefix}_offer_failure`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          role: this.role,
          sfuComponent: this.sfuComponent
        },
      }, `Screenshare offer generation failed`);
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
      userName: this.userName,
      callerName: this.userId,
      sdpOffer,
      hasAudio: !!this.hasAudio,
    };

    this.sendMessage(message);
  }

  startScreensharing () {
    return new Promise((resolve, reject) => {
      const options = {
        onicecandidate: (candidate) => {
          this.onIceCandidate(candidate, this.role);
        },
        videoStream: this.stream,
      };

      this.addIceServers(options);
      this.webRtcPeer = kurentoUtils.WebRtcPeer.WebRtcPeerSendonly(options, (error) => {
        if (error) {
          // 1305: "PEER_NEGOTIATION_FAILED",
          const normalizedError = BaseBroker.assembleError(1305);
          logger.error({
            logCode: `${this.logCodePrefix}_peer_creation_failed`,
            extraInfo: {
              errorMessage: error.name || error.message || 'Unknown error',
              errorCode: normalizedError.errorCode,
              role: this.role,
              sfuComponent: this.sfuComponent,
              started: this.started,
            },
          }, `Screenshare peer creation failed`);
          this.onerror(normalizedError);
          return reject(normalizedError);
        }

        this.webRtcPeer.iceQueue = [];
        this.webRtcPeer.generateOffer(this.onOfferGenerated.bind(this));

        const localStream = this.webRtcPeer.peerConnection.getLocalStreams()[0];

        localStream.getVideoTracks()[0].onended = () => {
          this.webRtcPeer.peerConnection.onconnectionstatechange = null;
          this.onstreamended();
        };

        localStream.getVideoTracks()[0].oninactive = () => {
          this.onstreamended();
        };

        return resolve();
      });

      this.webRtcPeer.peerConnection.onconnectionstatechange = () => {
        this.handleConnectionStateChange('screenshare');
      };
    });
  }

  onIceCandidate (candidate, role) {
    const message = {
      id: ON_ICE_CANDIDATE_MSG,
      role,
      type: this.sfuComponent,
      voiceBridge: this.voiceBridge,
      candidate,
      callerName: this.userId,
    };

    this.sendMessage(message);
  }

  subscribeToScreenStream () {
    return new Promise((resolve, reject) => {
      const options = {
        mediaConstraints: {
          audio: !!this.hasAudio,
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
              role: this.role,
              sfuComponent: this.sfuComponent,
              started: this.started,
            },
          }, `Screenshare peer creation failed`);
          this.onerror(normalizedError);
          return reject(normalizedError);
        }
        this.webRtcPeer.iceQueue = [];
        this.webRtcPeer.generateOffer(this.onOfferGenerated.bind(this));
      });

      this.webRtcPeer.peerConnection.onconnectionstatechange = () => {
        this.handleConnectionStateChange('screenshare');
      };
      return resolve();
    });
  }
}

export default ScreenshareBroker;
