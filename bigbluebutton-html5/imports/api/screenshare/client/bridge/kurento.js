import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import BridgeService from './service';
import ScreenshareBroker from '/imports/ui/services/bbb-webrtc-sfu/screenshare-broker';
import { setSharingScreen, screenShareEndAlert } from '/imports/ui/components/screenshare/service';
import { SCREENSHARING_ERRORS } from './errors';
import { shouldForceRelay } from '/imports/ui/services/bbb-webrtc-sfu/utils';

const SFU_CONFIG = Meteor.settings.public.kurento;
const SFU_URL = SFU_CONFIG.wsUrl;
const OFFERING = SFU_CONFIG.screenshare.subscriberOffering;
const SIGNAL_CANDIDATES = Meteor.settings.public.kurento.signalCandidates;

const BRIDGE_NAME = 'kurento'
const SCREENSHARE_VIDEO_TAG = 'screenshareVideo';
const SEND_ROLE = 'send';
const RECV_ROLE = 'recv';
const DEFAULT_VOLUME = 1;

// the error-code mapping is bridge specific; that's why it's not in the errors util
const ERROR_MAP = {
  1301: SCREENSHARING_ERRORS.SIGNALLING_TRANSPORT_DISCONNECTED,
  1302: SCREENSHARING_ERRORS.SIGNALLING_TRANSPORT_CONNECTION_FAILED,
  1305: SCREENSHARING_ERRORS.PEER_NEGOTIATION_FAILED,
  1307: SCREENSHARING_ERRORS.ICE_STATE_FAILED,
}

const mapErrorCode = (error) => {
  const { errorCode } = error;
  const mappedError = ERROR_MAP[errorCode];

  if (errorCode == null || mappedError == null) return error;
  error.errorCode = mappedError.errorCode;
  error.errorMessage = mappedError.errorMessage;
  error.message = mappedError.errorMessage;

  return error;
}

export default class KurentoScreenshareBridge {
  constructor() {
    this.role;
    this.broker;
    this._gdmStream;
    this.hasAudio = false;
    this.connectionAttempts = 0;
    this.reconnecting = false;
    this.reconnectionTimeout;
    this.restartIntervalMs = BridgeService.BASE_MEDIA_TIMEOUT;
  }

  get gdmStream() {
    return this._gdmStream;
  }

  set gdmStream(stream) {
    this._gdmStream = stream;
  }

  /**
   * Get the RTCPeerConnection object related to the screensharing stream.
   * @returns {Object} The RTCPeerConnection object related to the presenter/
   *                   viewer peer. If there's no stream being shared, returns
   *                   null.
   */
  getPeerConnection() {
    try {
      let peerConnection = null;

      if (this.broker && this.broker.webRtcPeer) {
        peerConnection = this.broker.webRtcPeer.peerConnection;
      }

      return peerConnection;
    } catch (error) {
      return null;
    }
  }

  outboundStreamReconnect() {
    const currentRestartIntervalMs = this.restartIntervalMs;
    const stream = this.gdmStream;

    logger.warn({
      logCode: 'screenshare_presenter_reconnect',
      extraInfo: {
        reconnecting: this.reconnecting,
        role: this.role,
        bridge: BRIDGE_NAME
      },
    }, `Screenshare presenter session is reconnecting`);

    this.stop();
    this.restartIntervalMs = BridgeService.getNextReconnectionInterval(currentRestartIntervalMs);
    this.share(stream, this.onerror).then(() => {
      this.clearReconnectionTimeout();
    }).catch(error => {
      // Error handling is a no-op because it will be "handled" in handlePresenterFailure
      logger.debug({
        logCode: 'screenshare_reconnect_failed',
        extraInfo: {
          errorCode: error.errorCode,
          errorMessage: error.errorMessage,
          reconnecting: this.reconnecting,
          role: this.role,
          bridge: BRIDGE_NAME
        },
      }, 'Screensharing reconnect failed');
    });
  }

  inboundStreamReconnect() {
    const currentRestartIntervalMs = this.restartIntervalMs;

    logger.warn({
      logCode: 'screenshare_viewer_reconnect',
      extraInfo: {
        reconnecting: this.reconnecting,
        role: this.role,
        bridge: BRIDGE_NAME
      },
    }, `Screenshare viewer session is reconnecting`);

    // Cleanly stop everything before triggering a reconnect
    this.stop();
    // Create new reconnect interval time
    this.restartIntervalMs = BridgeService.getNextReconnectionInterval(currentRestartIntervalMs);
    this.view(this.hasAudio).then(() => {
      this.clearReconnectionTimeout();
    }).catch(error => {
      // Error handling is a no-op because it will be "handled" in handleViewerFailure
      logger.debug({
        logCode: 'screenshare_reconnect_failed',
        extraInfo: {
          errorCode: error.errorCode,
          errorMessage: error.errorMessage,
          reconnecting: this.reconnecting,
          role: this.role,
          bridge: BRIDGE_NAME
        },
      }, 'Screensharing reconnect failed');
    });
  }

  handleConnectionTimeoutExpiry() {
    this.reconnecting = true;

    switch (this.role) {
      case RECV_ROLE:
        return this.inboundStreamReconnect();
      case SEND_ROLE:
        return this.outboundStreamReconnect();
      default:
        this.reconnecting = false;
        logger.error({
          logCode: 'screenshare_invalid_role'
        }, 'Screen sharing with invalid role, wont reconnect');
        break;
    }
  }

  maxConnectionAttemptsReached () {
    return this.connectionAttempts > BridgeService.MAX_CONN_ATTEMPTS;
  }

  scheduleReconnect () {
    if (this.reconnectionTimeout == null) {
      this.reconnectionTimeout = setTimeout(
        this.handleConnectionTimeoutExpiry.bind(this),
        this.restartIntervalMs
      );
    }
  }

  clearReconnectionTimeout () {
    this.reconnecting = false;
    this.restartIntervalMs = BridgeService.BASE_MEDIA_TIMEOUT;

    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;
    }
  }

  setVolume(volume) {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG);

    if (mediaElement) {
      if (typeof volume === 'number' && volume >= 0 && volume <= 1) {
        mediaElement.volume = volume;
      }

      return mediaElement.volume;
    }

    return DEFAULT_VOLUME;
  }

  getVolume() {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG);

    if (mediaElement) return mediaElement.volume;

    return DEFAULT_VOLUME;
  }

  handleViewerStart() {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG);

    if (mediaElement && this.broker && this.broker.webRtcPeer) {
      const stream = this.broker.webRtcPeer.getRemoteStream();
      BridgeService.screenshareLoadAndPlayMediaStream(stream, mediaElement, !this.broker.hasAudio);
    }

    this.clearReconnectionTimeout();
  }

  handleBrokerFailure(error) {
    mapErrorCode(error);
    const { errorMessage, errorCode } = error;

    logger.error({
      logCode: 'screenshare_broker_failure',
      extraInfo: {
        errorCode, errorMessage,
        role: this.broker.role,
        started: this.broker.started,
        reconnecting: this.reconnecting,
        bridge: BRIDGE_NAME
      },
    }, `Screenshare broker failure: ${errorMessage}`);

    // Screensharing was already successfully negotiated and error occurred during
    // during call; schedule a reconnect
    // If the session has not yet started, a reconnect should already be scheduled
    if (this.broker.started) {
      this.scheduleReconnect();
    }

    return error;
  }

  async view(hasAudio = false) {
    this.hasAudio = hasAudio;
    this.role = RECV_ROLE;
    const iceServers = await BridgeService.getIceServers(Auth.sessionToken);
    const options = {
      iceServers,
      userName: Auth.fullname,
      hasAudio,
      offering: OFFERING,
      mediaServer: BridgeService.getMediaServerAdapter(),
      signalCandidates: SIGNAL_CANDIDATES,
      forceRelay: shouldForceRelay(),
    };

    this.broker = new ScreenshareBroker(
      Auth.authenticateURL(SFU_URL),
      BridgeService.getConferenceBridge(),
      Auth.userID,
      Auth.meetingID,
      this.role,
      options,
    );

    this.broker.onstart = this.handleViewerStart.bind(this);
    this.broker.onerror = this.handleBrokerFailure.bind(this);
    this.broker.onended = this.handleEnded.bind(this);

    return this.broker.view().finally(this.scheduleReconnect.bind(this));
  }

  handlePresenterStart() {
    logger.info({
      logCode: 'screenshare_presenter_start_success',
    }, 'Screenshare presenter started succesfully');
    this.clearReconnectionTimeout();
    this.reconnecting = false;
    this.connectionAttempts = 0;
  }

  handleEnded() {
    screenShareEndAlert();
  }

  share(stream, onFailure) {
    return new Promise(async (resolve, reject) => {
      this.onerror = onFailure;
      this.connectionAttempts += 1;
      this.role = SEND_ROLE;
      this.hasAudio = BridgeService.streamHasAudioTrack(stream);
      this.gdmStream = stream;

      const onerror = (error) => {
        const normalizedError = this.handleBrokerFailure(error);
        if (this.maxConnectionAttemptsReached()) {
          this.clearReconnectionTimeout();
          this.connectionAttempts = 0;
          onFailure(SCREENSHARING_ERRORS.MEDIA_TIMEOUT);

          return reject(SCREENSHARING_ERRORS.MEDIA_TIMEOUT);
        }
      };

      const iceServers = await BridgeService.getIceServers(Auth.sessionToken);
      const options = {
        iceServers,
        userName: Auth.fullname,
        stream,
        hasAudio: this.hasAudio,
        bitrate: BridgeService.BASE_BITRATE,
        offering: true,
        mediaServer: BridgeService.getMediaServerAdapter(),
        signalCandidates: SIGNAL_CANDIDATES,
        forceRelay: shouldForceRelay(),
      };

      this.broker = new ScreenshareBroker(
        Auth.authenticateURL(SFU_URL),
        BridgeService.getConferenceBridge(),
        Auth.userID,
        Auth.meetingID,
        this.role,
        options,
      );

      this.broker.onerror = onerror.bind(this);
      this.broker.onstreamended = this.stop.bind(this);
      this.broker.onstart = this.handlePresenterStart.bind(this);
      this.broker.onended = this.handleEnded.bind(this);

      this.broker.share().then(() => {
          this.scheduleReconnect();
          return resolve();
        }).catch(reject);
    });
  };

  stop() {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG);

    if (this.broker) {
      this.broker.stop();
      // Checks if this session is a sharer and if it's not reconnecting
      // If that's the case, clear the local sharing state in screen sharing UI
      // component tracker to be extra sure we won't have any client-side state
      // inconsistency - prlanzarin
      if (this.broker && this.broker.role === SEND_ROLE && !this.reconnecting) {
        setSharingScreen(false);
      }
      this.broker = null;
    }

    if (mediaElement && typeof mediaElement.pause === 'function') {
      mediaElement.pause();
      mediaElement.srcObject = null;
    }

    this.gdmStream = null;
    this.clearReconnectionTimeout();
  }
}
