import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import BridgeService from './service';
import ScreenshareBroker from '/imports/ui/services/bbb-webrtc-sfu/screenshare-broker';
import { setIsSharing, screenShareEndAlert, setOutputDeviceId } from '/imports/ui/components/screenshare/service';
import { SCREENSHARING_ERRORS } from './errors';
import { shouldForceRelay } from '/imports/ui/services/bbb-webrtc-sfu/utils';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { notifyStreamStateChange } from '/imports/ui/services/bbb-webrtc-sfu/stream-state-service';
import { getRTCStatsLogMetadata } from '/imports/utils/stats';

const BRIDGE_NAME = 'kurento';
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

/* eslint-disable no-param-reassign */
const mapErrorCode = (error) => {
  const { errorCode } = error;
  const mappedError = ERROR_MAP[errorCode];

  if (errorCode == null || mappedError == null) return error;
  error.errorCode = mappedError.errorCode;
  error.errorMessage = mappedError.errorMessage;
  error.message = mappedError.errorMessage;

  return error;
};
/* eslint-enable no-param-reassign */

export default class KurentoScreenshareBridge {
  constructor() {
    /* eslint-disable no-unused-expressions */
    this.role;
    this.broker;
    this._gdmStream;
    this.hasAudio = false;
    this.connectionAttempts = 0;
    this.reconnecting = false;
    this.reconnectionTimeout;
    this._restartIntervalMs = null;
    /* eslint-enable no-unused-expressions */
    this.startedOnce = false;
    this.outputDeviceId = null;
    this.bridgeName = BRIDGE_NAME;
    // Map<streamId, { broker, mediaElementId }> for concurrent viewer subscriptions
    this._viewerBrokers = new Map();
  }

  get restartIntervalMs() {
    return this._restartIntervalMs || BridgeService.BASE_MEDIA_TIMEOUT();
  }

  set restartIntervalMs(value) {
    this._restartIntervalMs = value;
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

  setStreamEnabled(enabled) {
    if (this.gdmStream) {
      this.gdmStream.getTracks().forEach((track) => {
        // eslint-disable-next-line no-param-reassign
        track.enabled = enabled;
      });
    }
  }

  /**
   * Get stats about all active screenshare peers.
   *
   * For more information see:
   *  - https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   *  - https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport
   * @param {Array} [additionalStatsTypes] - A list of additional stats types to be included
   * in the parsing.
   *
   * @returns {Object} The information about each active screen sharing peer.
   *          The returned format follows the format returned by video's service
   *          getStats, which considers more than one peer connection to be returned.
   *          The format is given by:
   *          {
   *            peerIdString: RTCStatsReport
   *          }
   */
  async getStats(additionalStatsTypes = []) {
    let peerStats = null;
    const peer = this.getPeerConnection();

    if (!peer) return null;

    try {
      peerStats = await peer.getStats();
    } catch (error) {
      return null;
    }
    return BridgeService.parseStats({
      stats: peerStats,
      peer,
      additionalStatsTypes,
      bridgeName: BRIDGE_NAME,
      role: this.role,
    });
  }

  async getStatsLogData() {
    try {
      const screenshareStats = await this.getStats();

      return getRTCStatsLogMetadata(screenshareStats);
    } catch (error) {
      logger.warn({
        logCode: 'sfuaudio_stats_log_error',
        extraInfo: {
          errorMessage: error.message,
          bridge: this.bridgeName,
          role: this.role,
        },
      }, 'Failed to get audio stats log data');
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
          bridge: BRIDGE_NAME,
        },
      }, 'Screensharing reconnect failed');
    });
  }

  // eslint-disable-next-line consistent-return
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

  maxConnectionAttemptsReached() {
    return this.connectionAttempts > BridgeService.MAX_CONN_ATTEMPTS();
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

  clearReconnectionTimeout() {
    this.reconnecting = false;
    this.restartIntervalMs = BridgeService.BASE_MEDIA_TIMEOUT();

    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  _getPrimaryMediaElement() {
    return document.getElementById(SCREENSHARE_VIDEO_TAG)
      || document.querySelector(`video[id^="${SCREENSHARE_VIDEO_TAG}"]`);
  }

  setVolume(volume) {
    const mediaElement = this._getPrimaryMediaElement();

    if (mediaElement) {
      if (typeof volume === 'number' && volume >= 0 && volume <= 1) {
        mediaElement.volume = volume;
      }

      return mediaElement.volume;
    }

    return DEFAULT_VOLUME;
  }

  getVolume() {
    const mediaElement = this._getPrimaryMediaElement();

    if (mediaElement) return mediaElement.volume;

    return DEFAULT_VOLUME;
  }

  _handleViewerStartForStream(streamId, mediaElementId, broker) {
    const mediaElement = document.getElementById(mediaElementId);

    if (mediaElement && broker && broker.webRtcPeer) {
      const stream = broker.webRtcPeer.getRemoteStream();

      if (this.hasAudio && this.outputDeviceId && typeof this.outputDeviceId === 'string') {
        setOutputDeviceId(this.outputDeviceId);
      }

      BridgeService.screenshareLoadAndPlayMediaStream(stream, mediaElement, !broker.hasAudio);
    }

    this.startedOnce = true;
    this.clearReconnectionTimeout();
    this.connectionAttempts = 0;
    this.getStatsLogData().then((stats) => {
      logger.info({
        logCode: 'screenshare_viewer_start_success',
        extraInfo: {
          role: broker?.role || this.role,
          bridge: BRIDGE_NAME,
          streamId,
          mediaElementId,
          stats,
        },
      }, 'Screenshare viewer started successfully');
    });
  }

  handleViewerStart() {
    const mediaElementId = this._viewerBrokers.get(this.streamId)?.mediaElementId
      || SCREENSHARE_VIDEO_TAG;
    this._handleViewerStartForStream(this.streamId, mediaElementId, this.broker);
  }

  handleBrokerFailure(error) {
    mapErrorCode(error);
    const { errorMessage, errorCode } = error;

    return this.getStatsLogData().then((stats) => {
      logger.error({
        logCode: 'screenshare_broker_failure',
        extraInfo: {
          errorCode,
          errorMessage,
          role: this.role,
          started: this.broker?.started,
          reconnecting: this.reconnecting,
          bridge: BRIDGE_NAME,
          stats,
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
          overrideTimeout = BridgeService.BASE_RECONNECTION_TIMEOUT();
        }

        this.scheduleReconnect({ overrideTimeout });
      }

      return error;
    });
  }

  async view(streamId, options = {
    hasAudio: false,
    outputDeviceId: null,
    mediaElementId: null,
  }) {
    const SETTINGS = window.meetingClientSettings;
    const SFU_CONFIG = SETTINGS.public.kurento;
    const SFU_URL = SFU_CONFIG.wsUrl;
    const OFFERING = SFU_CONFIG.screenshare.subscriberOffering;
    const SIGNAL_CANDIDATES = SFU_CONFIG.signalCandidates;
    const TRACE_LOGS = SFU_CONFIG.traceLogs;
    const GATHERING_TIMEOUT = SFU_CONFIG.gatheringTimeout;
    const mediaElementId = options.mediaElementId || SCREENSHARE_VIDEO_TAG;
    this.streamId = streamId;
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
      // ICE restart only works for publishers right now - recvonly full
      // reconnection works ok without it.
      restartIce: false,
    };

    const viewerSessionBridge = options.publisherUserId
      ? `${BridgeService.getConferenceBridge()}:${options.publisherUserId}`
      : BridgeService.getConferenceBridge();
    const broker = new ScreenshareBroker(
      Auth.authenticateURL(SFU_URL),
      viewerSessionBridge,
      Auth.userID,
      Auth.meetingID,
      this.role,
      brokerOptions,
    );

    this._viewerBrokers.set(streamId, { broker, mediaElementId });
    // Keep this.broker pointing to the most recently created broker for backward compat
    this.broker = broker;

    broker.onstart = this._handleViewerStartForStream.bind(this, streamId, mediaElementId, broker);
    broker.onerror = this.handleBrokerFailure.bind(this);
    if (!this.reconnecting) {
      broker.onended = this.handleEnded.bind(this);
    }
    return broker.view().finally(this.scheduleReconnect.bind(this));
  }

  handlePresenterStart() {
    this.clearReconnectionTimeout();
    this.startedOnce = true;
    this.reconnecting = false;
    this.connectionAttempts = 0;
    this.getStatsLogData().then((stats) => {
      logger.info({
        logCode: 'screenshare_presenter_start_success',
        extraInfo: {
          role: this.broker?.role || this.role,
          bridge: BRIDGE_NAME,
          stats,
        },
      }, 'Screenshare presenter started succesfully');
    });
  }

  // eslint-disable-next-line class-methods-use-this
  handleEnded() {
    screenShareEndAlert();
  }

  share(stream, onFailure, contentType) {
    // eslint-disable-next-line no-async-promise-executor
    return new Promise(async (resolve, reject) => {
      const SETTINGS = window.meetingClientSettings;
      const SFU_CONFIG = SETTINGS.public.kurento;
      const SFU_URL = SFU_CONFIG.wsUrl;
      const SIGNAL_CANDIDATES = SFU_CONFIG.signalCandidates;
      const TRACE_LOGS = SFU_CONFIG.traceLogs;
      const { screenshare: NETWORK_PRIORITY } = SETTINGS.public.media.networkPriorities || {};
      const GATHERING_TIMEOUT = SFU_CONFIG.gatheringTimeout;
      const {
        enabled: RESTART_ICE = false,
        retries: RESTART_ICE_RETRIES = 3,
      } = SFU_CONFIG.restartIce?.screenshare || {};
      this.onerror = onFailure;
      this.connectionAttempts += 1;
      this.role = SEND_ROLE;
      this.hasAudio = BridgeService.streamHasAudioTrack(stream);
      this.gdmStream = stream;

      const onerror = async (error) => {
        const normalizedError = await this.handleBrokerFailure(error);
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
        contentType,
        bitrate: BridgeService.BASE_BITRATE(),
        offering: true,
        mediaServer: BridgeService.getMediaServerAdapter(),
        signalCandidates: SIGNAL_CANDIDATES,
        forceRelay: shouldForceRelay(),
        traceLogs: TRACE_LOGS,
        networkPriority: NETWORK_PRIORITY,
        gatheringTimeout: GATHERING_TIMEOUT,
        restartIce: RESTART_ICE,
        restartIceMaxRetries: RESTART_ICE_RETRIES,
      };

      const publisherSessionBridge = Auth.userID
        ? `${BridgeService.getConferenceBridge()}:${Auth.userID}`
        : BridgeService.getConferenceBridge();
      this.broker = new ScreenshareBroker(
        Auth.authenticateURL(SFU_URL),
        publisherSessionBridge,
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

  _stopViewerBrokers() {
    this._viewerBrokers.forEach(({ broker, mediaElementId }) => {
      try {
        broker.stop();
      } catch (_) { /* ignore */ }
      const el = document.getElementById(mediaElementId);
      if (el && typeof el.pause === 'function') {
        el.pause();
        el.srcObject = null;
      }
    });
    this._viewerBrokers.clear();
  }

  stop() {
    this._stopViewerBrokers();
    this._stop();
    this.connectionAttempts = 0;

    if (this.gdmStream) {
      MediaStreamUtils.stopMediaStreamTracks(this.gdmStream);
      this.gdmStream = null;
    }

    this.outputDeviceId = null;
  }
}
