import logger from '/imports/startup/client/logger';
import BaseBroker from '/imports/ui/services/bbb-webrtc-sfu/sfu-base-broker';

const ON_ICE_CANDIDATE_MSG = 'iceCandidate';
const SUBSCRIBER_ANSWER = 'subscriberAnswer';
const DTMF = 'dtmf';

const SFU_COMPONENT_NAME = 'fullaudio';

class FullAudioBroker extends BaseBroker {
  constructor(
    wsUrl,
    role,
    options = {},
  ) {
    super(SFU_COMPONENT_NAME, wsUrl);
    this.role = role;
    this.offering = true;

    // Optional parameters are: caleeName, iceServers, offering,
    // mediaServer, extension, constraints
    Object.assign(this, options);
  }

  getLocalStream() {
    if (this.webRtcPeer && this.webRtcPeer.peerConnection) {
      return this.webRtcPeer.peerConnection.getLocalStreams()[0];
    }

    return null;
  }

  setLocalStream(stream) {
    if (this.webRtcPeer == null || this.webRtcPeer.peerConnection == null) {
      throw new Error('Missing peer connection');
    }

    const { peerConnection } = this.webRtcPeer;
    const newTracks = stream.getAudioTracks();
    const localStream = this.getLocalStream();
    const oldTracks = localStream ? localStream.getAudioTracks() : [];

    peerConnection.getSenders().forEach((sender, index) => {
      if (sender.track && sender.track.kind === 'audio') {
        const newTrack = newTracks[index];
        if (newTrack == null) return;

        // Cleanup old tracks in the local MediaStream
        const oldTrack = oldTracks[index];
        sender.replaceTrack(newTrack);
        if (oldTrack) {
          oldTrack.stop();
          localStream.removeTrack(oldTrack);
        }
        localStream.addTrack(newTrack);
      }
    });

    return Promise.resolve();
  }

  joinAudio() {
    return new Promise((resolve, reject) => {
      const options = {
        mediaConstraints: {
          audio: this.constraints ? this.constraints : true,
          video: false,
        },
        configuration: this.populatePeerConfiguration(),
        onicecandidate: (candidate) => {
          this.onIceCandidate(candidate, this.role);
        },
      };

      const WebRTCPeer = (this.role === 'sendrecv')
        ? kurentoUtils.WebRtcPeer.WebRtcPeerSendrecv
        : kurentoUtils.WebRtcPeer.WebRtcPeerRecvonly;

      this.webRtcPeer = WebRTCPeer(options, (error) => {
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
          }, 'Audio peer creation failed');
          this.onerror(normalizedError);
          return reject(normalizedError);
        }

        this.webRtcPeer.iceQueue = [];

        if (this.offering) {
          this.webRtcPeer.generateOffer(this.onOfferGenerated.bind(this));
        } else {
          this.sendStartReq();
        }

        return resolve();
      });

      this.webRtcPeer.peerConnection.onconnectionstatechange = this
        .handleConnectionStateChange.bind(this);
      return resolve();
    });
  }

  listen() {
    return this.openWSConnection()
      .then(this.joinAudio.bind(this));
  }

  onWSMessage (message) {
    const parsedMessage = JSON.parse(message.data);

    switch (parsedMessage.id) {
      case 'startResponse':
        this.onRemoteDescriptionReceived(parsedMessage);
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

  sendLocalDescription (localDescription) {
    const message = {
      id: SUBSCRIBER_ANSWER,
      type: this.sfuComponent,
      role: this.role,
      sdpOffer: localDescription,
    };

    this.sendMessage(message);
  }

  onRemoteDescriptionReceived (sfuResponse) {
    if (this.offering) {
      return this.processAnswer(sfuResponse);
    }

    return this.processOffer(sfuResponse);
  }

  sendStartReq (offer) {
    const message = {
      id: 'start',
      type: this.sfuComponent,
      role: this.role,
      caleeName: this.caleeName,
      sdpOffer: offer,
      mediaServer: this.mediaServer,
      extension: this.extension,
    };

    logger.debug({
      logCode: `${this.logCodePrefix}_offer_generated`,
      extraInfo: { sfuComponent: this.sfuComponent, role: this.role },
    }, `SFU audio offer generated`);

    this.sendMessage(message);
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
      return this.onerror(error);
    }

    this.sendStartReq(sdpOffer);
  }

  dtmf (tones) {
    const message = {
      id: DTMF,
      type: this.sfuComponent,
      tones,
    };

    this.sendMessage(message);
  }

  onIceCandidate (candidate, role) {
    const message = {
      id: ON_ICE_CANDIDATE_MSG,
      role,
      type: this.sfuComponent,
      candidate,
    };

    this.sendMessage(message);
  }
}

export default FullAudioBroker;
