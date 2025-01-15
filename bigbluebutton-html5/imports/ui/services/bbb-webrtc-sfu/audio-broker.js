import logger from '/imports/startup/client/logger';
import BaseBroker from '/imports/ui/services/bbb-webrtc-sfu/sfu-base-broker';
import WebRtcPeer from '/imports/ui/services/webrtc-base/peer';

const ON_ICE_CANDIDATE_MSG = 'iceCandidate';
const SUBSCRIBER_ANSWER = 'subscriberAnswer';
const DTMF = 'dtmf';

const SFU_COMPONENT_NAME = 'audio';

class AudioBroker extends BaseBroker {
  constructor(
    wsUrl,
    role,
    options = {},
  ) {
    super(SFU_COMPONENT_NAME, wsUrl);
    this.role = role;
    this.offering = true;

    // Optional parameters are:
    // clientSessionNumber
    // iceServers,
    // offering,
    // mediaServer,
    // extension,
    // constraints,
    // stream,
    // signalCandidates
    // traceLogs
    // networkPriority
    // gatheringTimeout
    // transparentListenOnly
    Object.assign(this, options);
  }

  getLocalStream() {
    if (this.webRtcPeer && typeof this.webRtcPeer.getLocalStream === 'function') {
      return this.webRtcPeer.getLocalStream();
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

  _join() {
    return new Promise((resolve, reject) => {
      try {
        const options = {
          audioStream: this.stream,
          mediaConstraints: {
            audio: this.constraints ? this.constraints : true,
            video: false,
          },
          configuration: this.populatePeerConfiguration(),
          onicecandidate: !this.signalCandidates ? null : (candidate) => {
            this.onIceCandidate(candidate, this.role);
          },
          trace: this.traceLogs,
          networkPriorities: this.networkPriority ? { audio: this.networkPriority } : undefined,
          mediaStreamFactory: this.mediaStreamFactory,
          gatheringTimeout: this.gatheringTimeout,
        };

        const peerRole = this.role === 'sendrecv' ? this.role : 'recvonly';
        this.webRtcPeer = new WebRtcPeer(peerRole, options);
        this.webRtcPeer.iceQueue = [];
        this.webRtcPeer.start();
        this.webRtcPeer.peerConnection.onconnectionstatechange = this.handleConnectionStateChange.bind(this);

        if (this.offering) {
          // We are the offerer
          this.webRtcPeer.generateOffer()
            .then(this.sendStartReq.bind(this))
            .catch(this._handleOfferGenerationFailure.bind(this));
        } else if (peerRole === 'recvonly') {
          // We are the answerer and we are only listening, so we don't need
          // to acquire local media
          this.sendStartReq();
        } else {
          // We are the answerer and we are sending audio, so we need to acquire
          // local media before sending the start request
          this.webRtcPeer.mediaStreamFactory()
            .then(() => { this.sendStartReq(); })
            .catch(this._handleOfferGenerationFailure.bind(this));
        }

        resolve();
      } catch (error) {
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
        reject(normalizedError);
      }
    });
  }

  joinAudio() {
    return this.openWSConnection()
      .then(this._join.bind(this));
  }

  onWSMessage(message) {
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
      case 'restartIceResponse':
        this.handleRestartIceResponse(parsedMessage);
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
          extraInfo: { messageId: parsedMessage.id || 'Unknown', sfuComponent: this.sfuComponent },
        }, 'Discarded invalid SFU message');
    }
  }

  handleSFUError(sfuResponse) {
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
    }, 'Audio failed in SFU');
    this.onerror(error);
  }

  sendLocalDescription(localDescription) {
    const message = {
      id: SUBSCRIBER_ANSWER,
      type: this.sfuComponent,
      role: this.role,
      sdpOffer: localDescription,
    };

    this.sendMessage(message);
  }

  onRemoteDescriptionReceived(sfuResponse) {
    if (this.offering) {
      return this.processAnswer(sfuResponse);
    }

    return this.processOffer(sfuResponse);
  }

  sendStartReq(offer) {
    const message = {
      id: 'start',
      type: this.sfuComponent,
      role: this.role,
      clientSessionNumber: this.clientSessionNumber,
      sdpOffer: offer,
      mediaServer: this.mediaServer,
      extension: this.extension,
      transparentListenOnly: this.transparentListenOnly,
    };

    logger.debug({
      logCode: `${this.logCodePrefix}_offer_generated`,
      extraInfo: { sfuComponent: this.sfuComponent, role: this.role },
    }, 'SFU audio offer generated');

    this.sendMessage(message);
  }

  _handleOfferGenerationFailure(error) {
    if (error) {
      logger.error({
        logCode: `${this.logCodePrefix}_offer_failure`,
        extraInfo: {
          errorMessage: error.name || error.message || 'Unknown error',
          sfuComponent: this.sfuComponent,
        },
      }, 'Audio offer generation failed');
      // 1305: "PEER_NEGOTIATION_FAILED",
      this.onerror(error);
    }
  }

  dtmf(tones) {
    const message = {
      id: DTMF,
      type: this.sfuComponent,
      tones,
    };

    this.sendMessage(message);
  }

  onIceCandidate(candidate, role) {
    const message = {
      id: ON_ICE_CANDIDATE_MSG,
      role,
      type: this.sfuComponent,
      candidate,
    };

    this.sendMessage(message);
  }
}

export default AudioBroker;
