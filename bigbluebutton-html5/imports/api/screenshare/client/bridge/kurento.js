import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import BridgeService from './service';
import ScreenshareBroker from '/imports/ui/services/bbb-webrtc-sfu/screenshare-broker';
import { setIsSharing, screenShareEndAlert, setOutputDeviceId } from '/imports/ui/components/screenshare/service';
import { SCREENSHARING_ERRORS } from './errors';
import { shouldForceRelay } from '/imports/ui/services/bbb-webrtc-sfu/utils';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { notifyStreamStateChange } from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';

const SFU_CONFIG = Meteor.settings.public.kurento;
const SFU_URL = SFU_CONFIG.wsUrl;
const OFFERING = SFU_CONFIG.screenshare.subscriberOffering;
const SIGNAL_CANDIDATES = Meteor.settings.public.kurento.signalCandidates;
const TRACE_LOGS = Meteor.settings.public.kurento.traceLogs;
const { screenshare: NETWORK_PRIORITY } = Meteor.settings.public.media.networkPriorities || {};
const GATHERING_TIMEOUT = Meteor.settings.public.kurento.gatheringTimeout;
const {
  enabled: RESTART_ICE = false,
  retries: RESTART_ICE_RETRIES = 3,
} = Meteor.settings.public.kurento?.restartIce?.screenshare || {};

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
  1310: SCREENSHARING_ERRORS.ENDED_WHILE_STARTING,
};

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
    this.startedOnce = false;
    this.outputDeviceId = null;
  }

  get gdmStream() {
    return this._gdmStream;
  }

  set gdmStream(stream) {
    this._gdmStream = stream;
  }

  _shouldReconnect() {
    // Sender/presenter reconnect is *not* implemented yet
    return this.reconnectionTimeout == null && this.role === RECV_ROLE;
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

  inboundStreamReconnect() {
    const currentRestartIntervalMs = this.restartIntervalMs;

    logger.warn({
      logCode: 'screenshare_viewer_reconnect',
      extraInfo: {
        reconnecting: this.reconnecting,
        role: this.role,
        bridge: BRIDGE_NAME,
      },
    }, 'Screenshare viewer is reconnecting');

    // Cleanly stop everything before triggering a reconnect
    this._stop();
    // Create new reconnect interval time
    this.restartIntervalMs = BridgeService.getNextReconnectionInterval(currentRestartIntervalMs);
    this.view(this.hasAudio).then(() => {
      this.clearReconnectionTimeout();
    }).catch((error) => {
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

      // Sender/presenter reconnect is *not* implemented yet
      case SEND_ROLE:
      default:
        this.reconnecting = false;
        logger.error({
          logCode: 'screenshare_wont_reconnect',
          extraInfo: {
            role: this.broker?.role || this.role,
            started: !!(this.broker?.started),
            bridge: BRIDGE_NAME,
          },
        }, 'Screen sharing will not reconnect');
        break;
    }
  }

  maxConnectionAttemptsReached () {
    return this.connectionAttempts > BridgeService.MAX_CONN_ATTEMPTS;
  }

  scheduleReconnect({
    overrideTimeout,
  } = { }) {
    if (this.reconnectionTimeout == null) {
      let nextRestartInterval = this.restartIntervalMs;
      if (typeof overrideTimeout === 'number') nextRestartInterval = overrideTimeout;

      this.reconnectionTimeout = setTimeout(
        this.handleConnectionTimeoutExpiry.bind(this),
        nextRestartInterval,
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

      if (this.hasAudio && this.outputDeviceId && typeof this.outputDeviceId === 'string') {
        setOutputDeviceId(this.outputDeviceId);
      }

      BridgeService.screenshareLoadAndPlayMediaStream(stream, mediaElement, !this.broker.hasAudio);
    }

    this.startedOnce = true;
    this.clearReconnectionTimeout();
    this.connectionAttempts = 0;
  }

  handleBrokerFailure(error) {
    mapErrorCode(error);
    const { errorMessage, errorCode } = error;

    logger.error({
      logCode: 'screenshare_broker_failure',
      extraInfo: {
        errorCode,
        errorMessage,
        role: this.broker.role,
        started: this.broker.started,
        reconnecting: this.reconnecting,
        bridge: BRIDGE_NAME,
      },
    }, `Screenshare broker failure: ${errorMessage}`);

    notifyStreamStateChange('screenshare', 'failed');
    // Screensharing was already successfully negotiated and error occurred during
    // during call; schedule a reconnect
    if (this._shouldReconnect()) {
      // this.broker.started => whether the reconnect should happen immediately.
      // If this session previously established connection (N-sessions back)
      // and it failed abruptly, then the timeout is overridden to a intermediate value
      // (BASE_RECONNECTION_TIMEOUT)
      let overrideTimeout;
      if (this.broker?.started) {
        overrideTimeout = 0;
      } else if (this.startedOnce) {
        overrideTimeout = BridgeService.BASE_RECONNECTION_TIMEOUT;
      }

      this.scheduleReconnect({ overrideTimeout });
    }

    return error;
  }

  async view(options = {
    hasAudio: false,
    outputDeviceId: null,
  }) {
    this.hasAudio = options.hasAudio;
    this.outputDeviceId = options.outputDeviceId;
    this.role = RECV_ROLE;
    const iceServers = await BridgeService.getIceServers(Auth.sessionToken);
    const brokerOptions = {
      iceServers,
      userName: Auth.fullname,
      hasAudio: options.hasAudio,
      offering: OFFERING,
      mediaServer: BridgeService.getMediaServerAdapter(),
      signalCandidates: SIGNAL_CANDIDATES,
      forceRelay: shouldForceRelay(),
      traceLogs: TRACE_LOGS,
      gatheringTimeout: GATHERING_TIMEOUT,
      restartIce: RESTART_ICE,
      restartIceMaxRetries: RESTART_ICE_RETRIES,
    };

    this.broker = new ScreenshareBroker(
      Auth.authenticateURL(SFU_URL),
      BridgeService.getConferenceBridge(),
      Auth.userID,
      Auth.meetingID,
      this.role,
      brokerOptions,
    );

    this.broker.onstart = this.handleViewerStart.bind(this);
    this.broker.onerror = this.handleBrokerFailure.bind(this);
    if (!this.reconnecting) {
      this.broker.onended = this.handleEnded.bind(this);
    }
    return this.broker.view().finally(this.scheduleReconnect.bind(this));
  }

  handlePresenterStart() {
    logger.info({
      logCode: 'screenshare_presenter_start_success',
    }, 'Screenshare presenter started succesfully');
    this.clearReconnectionTimeout();
    this.startedOnce = true;
    this.reconnecting = false;
    this.connectionAttempts = 0;
  }

  handleEnded() {
    screenShareEndAlert();
  }

  share(stream, onFailure, contentType) {
    return new Promise(async (resolve, reject) => {
      this.onerror = onFailure;
      this.connectionAttempts += 1;
      this.role = SEND_ROLE;
      this.hasAudio = BridgeService.streamHasAudioTrack(stream);
      this.gdmStream = stream;

      const onerror = (error) => {
        const normalizedError = this.handleBrokerFailure(error);
        if (!this.broker.started) {
        // Broker hasn't started - if there are retries left, try again.
          if (this.maxConnectionAttemptsReached()) {
            this.clearReconnectionTimeout();
            this.connectionAttempts = 0;
            onFailure(SCREENSHARING_ERRORS.MEDIA_TIMEOUT);
            reject(SCREENSHARING_ERRORS.MEDIA_TIMEOUT);
          }
        } else if (!this._shouldReconnect()) {
          // Broker has started - should reconnect? If it shouldn't, end it.
          onFailure(normalizedError);
        }
      };

      const iceServers = await BridgeService.getIceServers(Auth.sessionToken);
      const options = {
        iceServers,
        userName: Auth.fullname,
        stream,
        hasAudio: this.hasAudio,
        contentType: contentType,
        bitrate: BridgeService.BASE_BITRATE,
        offering: true,
        mediaServer: BridgeService.getMediaServerAdapter(),
        signalCandidates: SIGNAL_CANDIDATES,
        forceRelay: shouldForceRelay(),
        traceLogs: TRACE_LOGS,
        networkPriority: NETWORK_PRIORITY,
        gatheringTimeout: GATHERING_TIMEOUT,
        restartIce: RESTART_ICE,
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
      }).catch((error) => reject(mapErrorCode(error)));
    });
  }

  // This is a reconnect-safe internal method. Should be used when one wants
  // to clear the internal components (ie broker, connection timeouts) without
  // affecting externally controlled components (ie gDM stream,
  // media tag, connectionAttempts, ...)
  _stop() {
    if (this.broker) {
      this.broker.stop();
      // Checks if this session is a sharer and if it's not reconnecting
      // If that's the case, clear the local sharing state in screen sharing UI
      // component tracker to be extra sure we won't have any client-side state
      // inconsistency - prlanzarin
      if (this.broker && this.broker.role === SEND_ROLE && !this.reconnecting) {
        setIsSharing(false);
      }
      this.broker = null;
    }

    this.clearReconnectionTimeout();
  }

  stop() {
    const mediaElement = document.getElementById(SCREENSHARE_VIDEO_TAG);

    this._stop();
    this.connectionAttempts = 0;

    if (mediaElement && typeof mediaElement.pause === 'function') {
      mediaElement.pause();
      mediaElement.srcObject = null;
    }

    if (this.gdmStream) {
      MediaStreamUtils.stopMediaStreamTracks(this.gdmStream);
      this.gdmStream = null;
    }

    this.outputDeviceId = null;
  }
}
