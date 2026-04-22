import BaseAudioBridge from './base';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import AudioBroker from '/imports/ui/services/bbb-webrtc-sfu/audio-broker';
import loadAndPlayMediaStream from '/imports/ui/services/bbb-webrtc-sfu/load-play';
import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun,
} from '/imports/utils/fetchStunTurnServers';
import getFromUserSettings from '/imports/ui/services/users-settings';
import browserInfo from '/imports/utils/browserInfo';
import {
  getAudioSessionNumber,
  getAudioConstraints,
  filterSupportedConstraints,
  doGUM,
} from '/imports/api/audio/client/bridge/service';
import { shouldForceRelay } from '/imports/ui/services/bbb-webrtc-sfu/utils';

const SENDRECV_ROLE = 'sendrecv';
const RECV_ROLE = 'recv';
const PASSIVE_SENDRECV_ROLE = 'passive-sendrecv';
const BRIDGE_NAME = 'fullaudio';
const IS_CHROME = browserInfo.isChrome;

// SFU's base broker has distinct error codes so that it can be reused by different
// modules. Errors that have a valid, localized counterpart in audio manager are
// mapped so that the user gets a localized error message.
// The ones that haven't (ie SFU's servers-side errors), aren't mapped.
const errorCodeMap = {
  1301: 1001,
  1302: 1002,
  1305: 1005,
  1307: 1007,
};

// Error codes that are prone to a retry according to RETRY_THROUGH_RELAY
const RTC_CONNECTIVITY_ERRORS = [1007, 1010];
const RETRYABLE_ERRORS = [...RTC_CONNECTIVITY_ERRORS, 1002, 1005];

const mapErrorCode = (error) => {
  const { errorCode } = error;
  const mappedErrorCode = errorCodeMap[errorCode];
  if (errorCode == null || mappedErrorCode == null) return error;
  // eslint-disable-next-line no-param-reassign
  error.errorCode = mappedErrorCode;
  return error;
};

const getMediaServerAdapter = (listenOnly = false) => {
  const SETTINGS = window.meetingClientSettings;
  const MEDIA = SETTINGS.public.media;
  const DEFAULT_LISTENONLY_MEDIA_SERVER = SETTINGS.public.kurento.listenOnlyMediaServer;
  const DEFAULT_FULLAUDIO_MEDIA_SERVER = MEDIA.audio.fullAudioMediaServer;

  if (listenOnly) {
    return DEFAULT_LISTENONLY_MEDIA_SERVER;
  }

  return DEFAULT_FULLAUDIO_MEDIA_SERVER;
};

const isTransparentListenOnlyEnabled = () => {
  const SETTINGS = window.meetingClientSettings;
  const MEDIA = SETTINGS.public.media;
  const TRANSPARENT_LISTEN_ONLY = MEDIA.transparentListenOnly;
  return getFromUserSettings(
    'bbb_transparent_listen_only',
    TRANSPARENT_LISTEN_ONLY,
  );
};

export default class SFUAudioBridge extends BaseAudioBridge {
  static getOfferingRole(isListenOnly) {
    const SETTINGS = window.meetingClientSettings;
    const MEDIA = SETTINGS.public.media;
    const LISTEN_ONLY_OFFERING = MEDIA.listenOnlyOffering;
    const FULLAUDIO_OFFERING = MEDIA.fullAudioOffering;
    return isListenOnly && !isTransparentListenOnlyEnabled()
      ? LISTEN_ONLY_OFFERING
      : (!isTransparentListenOnlyEnabled() && FULLAUDIO_OFFERING);
  }

  constructor(userData) {
    super();
    this.userId = userData.userId;
    this.name = userData.username;
    this.sessionToken = userData.sessionToken;
    this.broker = null;
    this.reconnecting = false;
    this.iceServers = [];
    this.bridgeName = BRIDGE_NAME;
    this.isListenOnly = false;
    this.bypassGUM = false;
    this.supportsTransparentListenOnly = isTransparentListenOnlyEnabled;

    this.handleTermination = this.handleTermination.bind(this);
  }

  set reconnecting(value) {
    this._reconnecting = value;
  }

  get reconnecting() {
    return this._reconnecting;
  }

  get inputStream() {
    // Only return the stream if the broker is active and the role isn't recvonly
    // Input stream == actual input-capturing stream, not the one that's being played
    if (this.broker && this.role !== RECV_ROLE) {
      return this.broker.getLocalStream();
    }

    return null;
  }

  get role() {
    return this.broker?.role;
  }

  getBrokerRole({ hasInputStream }) {
    if (this.isListenOnly) {
      return isTransparentListenOnlyEnabled()
        ? PASSIVE_SENDRECV_ROLE
        : RECV_ROLE;
    }

    if (this.bypassGUM && !hasInputStream) return PASSIVE_SENDRECV_ROLE;

    return SENDRECV_ROLE;
  }

  setInputStream(stream) {
    if (this.broker == null) return null;

    return this.broker.setLocalStream(stream);
  }

  getPeerConnection() {
    if (!this.broker) return null;

    const { webRtcPeer } = this.broker;
    if (webRtcPeer) return webRtcPeer.peerConnection;
    return null;
  }

  // eslint-disable-next-line class-methods-use-this
  mediaStreamFactory(constraints) {
    return doGUM(constraints, true);
  }

  setConnectionTimeout() {
    if (this.connectionTimeout) this.clearConnectionTimeout();

    const SETTINGS = window.meetingClientSettings;
    const MEDIA = SETTINGS.public.media;
    const CONNECTION_TIMEOUT_MS = MEDIA.listenOnlyCallTimeout || 15000;

    const createTimeout = (resolve, reject) => {
      this.connectionTimeout = setTimeout(() => {
        const error = new Error(`ICE negotiation timeout after ${CONNECTION_TIMEOUT_MS / 1000}s`);
        error.errorCode = 1010;
        // Duplicating key-vals because I can'decide settle on an error pattern - prlanzarin again
        error.errorCause = error.message;
        error.errorMessage = error.message;
        this.handleBrokerFailure(error).then(resolve).catch(reject);
      }, CONNECTION_TIMEOUT_MS);
    };

    this._timeoutPromise = new Promise((resolve, reject) => {
      createTimeout(resolve, reject);
    });

    return this._timeoutPromise;
  }

  clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    if (this._timeoutPromise) {
      this._timeoutPromise = null;
    }
  }

  dispatchAutoplayHandlingEvent(mediaElement) {
    const tagFailedEvent = new CustomEvent('audioPlayFailed', {
      detail: { mediaElement },
    });
    window.dispatchEvent(tagFailedEvent);
    this.callback({ status: this.baseCallStates.autoplayBlocked, bridge: this.bridgeName });
  }

  reconnect(options = {}) {
    // If broker hasn't started, override termination handler so the ended callback
    // doesn't get triggered - this is a retry attempt and the user shouldn't be
    // terminated yet
    if (!this.broker?.started) {
      this.broker.onended = () => {};
    }

    // Notify the user that the bridge is reconnecting - this can be read as
    // a re-connect attempt or a retry attempt (when join fails)
    this.callback({ status: this.baseCallStates.reconnecting, bridge: this.bridgeName });
    this.reconnecting = true;

    if (this.broker) this.broker.stop();

    return this._startBroker({ isListenOnly: this.isListenOnly, ...options })
      .catch((error) => {
        // Error handling is a no-op because it will be "handled" in handleBrokerFailure
        logger.debug({
          logCode: 'sfuaudio_reconnect_failed',
          extraInfo: {
            errorMessage: error.errorMessage,
            reconnecting: this.reconnecting,
            bridge: this.bridgeName,
            role: this.role,
          },
        }, 'SFU audio reconnect failed');

        throw error;
      });
  }

  handleBrokerFailure(error) {
    return new Promise((resolve, reject) => {
      this.clearConnectionTimeout();
      mapErrorCode(error);
      const { errorMessage, errorCause, errorCode } = error;
      const SETTINGS = window.meetingClientSettings;
      const MEDIA = SETTINGS.public.media;
      const RETRY_THROUGH_RELAY = MEDIA.audio.retryThroughRelay || false;

      if (!this.reconnecting) {
        if (this.broker?.started) {
          logger.error({
            logCode: 'sfuaudio_error_try_to_reconnect',
            extraInfo: {
              errorMessage,
              errorCode,
              errorCause,
              bridge: this.bridgeName,
              role: this.role,
            },
          }, 'SFU audio failed, try to reconnect');

          return this.reconnect().then(resolve).catch(reject);
        }

        if (RETRYABLE_ERRORS.includes(errorCode)) {
          const forceRelay = RETRY_THROUGH_RELAY && RTC_CONNECTIVITY_ERRORS.includes(errorCode);
          logger.error({
            logCode: 'sfuaudio_error_retry',
            extraInfo: {
              errorMessage,
              errorCode,
              errorCause,
              bridge: this.bridgeName,
              role: this.role,
              forceRelay,
            },
          }, `SFU audio failed to connect, retrying (relay=${forceRelay})`);

          return this.reconnect({ forceRelay }).then(resolve).catch(reject);
        }
      }

      // Already tried reconnecting once OR the user handn't successfully
      // connected firsthand and retrying isn't an option. Finish the session
      // and reject with the error
      logger.error({
        logCode: 'sfuaudio_error',
        extraInfo: {
          errorMessage,
          errorCode,
          errorCause,
          reconnecting: this.reconnecting,
          bridge: this.bridgeName,
          role: this.role,
        },
      }, 'SFU audio failed');
      this.clearConnectionTimeout();

      if (this.broker) this.broker.stop();

      this.callback({
        status: this.baseCallStates.failed,
        error: errorCode,
        bridgeError: errorMessage,
        bridge: this.bridgeName,
      });
      return reject(error);
    });
  }

  handleTermination() {
    this.clearConnectionTimeout();

    if (!this.reconnecting) {
      this.callback({ status: this.baseCallStates.ended, bridge: this.bridgeName });
    }
  }

  handleStart() {
    const SETTINGS = window.meetingClientSettings;
    const MEDIA = SETTINGS.public.media;
    const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');
    const stream = this.broker.webRtcPeer.getRemoteStream();
    const mediaElement = document.getElementById(MEDIA_TAG);

    return loadAndPlayMediaStream(stream, mediaElement, false).then(() => {
      this.callback({
        status: this.baseCallStates.started,
        bridge: this.bridgeName,
      });
      this.clearConnectionTimeout();
      this.reconnecting = false;
    }).catch((error) => {
      // NotAllowedError equals autoplay issues, fire autoplay handling event.
      // This will be handled in audio-manager.
      if (error.name === 'NotAllowedError') {
        logger.error({
          logCode: 'sfuaudio_error_autoplay',
          extraInfo: {
            errorName: error.name,
            bridge: this.bridgeName,
            role: this.role,
          },
        }, 'SFU audio media play failed due to autoplay error');
        this.dispatchAutoplayHandlingEvent(mediaElement);
        // For connection purposes, this worked - the autoplay thing is a client
        // side soft issue to be handled at the UI/UX level, not WebRTC/negotiation
        // So: clear the connection timer
        this.clearConnectionTimeout();
        this.reconnecting = false;
      } else {
        const normalizedError = {
          errorCode: 1004,
          errorMessage: error.message || 'AUDIO_PLAY_FAILED',
        };
        this.callback({
          status: this.baseCallStates.failed,
          error: normalizedError.errorCode,
          bridgeError: normalizedError.errorMessage,
          bridge: this.bridgeName,
        });
        throw normalizedError;
      }
    });
  }

  async _startBroker(options) {
    try {
      this.iceServers = await fetchWebRTCMappedStunTurnServers(this.sessionToken);
    } catch (error) {
      logger.error({ logCode: 'sfuaudio_stun-turn_fetch_failed' },
        'SFU audio bridge failed to fetch STUN/TURN info, using default servers');
      this.iceServers = getMappedFallbackStun();
    }

    return new Promise((resolve, reject) => {
      const {
        isListenOnly,
        extension,
        inputStream,
        forceRelay: _forceRelay = false,
        bypassGUM = false,
      } = options;
      const _reconnecting = this.reconnecting;

      const SETTINGS = window.meetingClientSettings;
      const MEDIA = SETTINGS.public.media;
      const SIGNAL_CANDIDATES = SETTINGS.public.kurento.signalCandidates;
      const SFU_URL = SETTINGS.public.kurento.wsUrl;
      const TRACE_LOGS = SETTINGS.public.kurento.traceLogs;
      const GATHERING_TIMEOUT = SETTINGS.public.kurento.gatheringTimeout;
      const { audio: NETWORK_PRIORITY } = MEDIA.networkPriorities || {};
      const {
        enabled: RESTART_ICE = false,
        retries: RESTART_ICE_RETRIES = 1,
      } = SETTINGS.public.kurento?.restartIce?.audio || {};

      const handleInitError = (_error) => {
        mapErrorCode(_error);
        if (!RETRYABLE_ERRORS.includes(_error?.errorCode) || _reconnecting) {
          reject(_error);
        }
      };

      try {
        this.inEchoTest = !!extension;
        this.isListenOnly = isListenOnly;
        this.bypassGUM = bypassGUM;
        const role = this.getBrokerRole({
          hasInputStream: !!inputStream,
        });

        const brokerOptions = {
          clientSessionNumber: getAudioSessionNumber(),
          extension,
          iceServers: this.iceServers,
          mediaServer: getMediaServerAdapter(isListenOnly),
          constraints: getAudioConstraints({ deviceId: this.inputDeviceId }),
          forceRelay: _forceRelay || shouldForceRelay(),
          stream: (inputStream && inputStream.active) ? inputStream : undefined,
          offering: SFUAudioBridge.getOfferingRole(this.isListenOnly),
          signalCandidates: SIGNAL_CANDIDATES,
          traceLogs: TRACE_LOGS,
          networkPriority: NETWORK_PRIORITY,
          mediaStreamFactory: this.mediaStreamFactory,
          gatheringTimeout: GATHERING_TIMEOUT,
          transparentListenOnly: isTransparentListenOnlyEnabled(),
          bypassGUM,
          // ICE restart only works for publishers right now - recvonly full
          // reconnection works ok without it.
          restartIce: RESTART_ICE && !isListenOnly,
          restartIceMaxRetries: RESTART_ICE_RETRIES,
        };

        this.broker = new AudioBroker(
          Auth.authenticateURL(SFU_URL),
          role,
          brokerOptions,
        );

        this.broker.onended = this.handleTermination.bind(this);
        this.broker.onerror = (error) => {
          // Broker failures can be successfully handled if they're retryable
          // and the attempt to reconnect is successful. In that case, this
          // promise will resolve and the connection will be established
          // normally
          this.handleBrokerFailure(error).then(resolve).catch(reject);
        };
        this.broker.onstart = () => {
          this.handleStart().then(resolve).catch(reject);
        };

        // Set up a connectionTimeout in case the server or network are botching
        // negotiation or conn checks.
        this.setConnectionTimeout().then(resolve).catch(reject);
        this.broker.joinAudio().catch(handleInitError);
      } catch (error) {
        handleInitError(error);
      }
    });
  }

  async joinAudio(options, callback) {
    this.callback = callback;
    this.reconnecting = false;

    return this._startBroker(options);
  }

  sendDtmf(tones) {
    if (this.broker) {
      this.broker.dtmf(tones);
    }
  }

  transferCall(onTransferSuccess) {
    this.inEchoTest = false;
    return this.trackTransferState(onTransferSuccess);
  }

  async updateAudioConstraints(constraints) {
    try {
      if (typeof constraints !== 'object') return;

      const matchConstraints = filterSupportedConstraints(constraints);

      if (IS_CHROME) {
        matchConstraints.deviceId = this.inputDeviceId;
        const stream = await doGUM({ audio: matchConstraints });
        await this.setInputStream(stream);
      } else {
        this.inputStream.getAudioTracks()
          .forEach((track) => track.applyConstraints(matchConstraints));
      }
    } catch (error) {
      logger.error({
        logCode: 'sfuaudio_audio_constraint_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          bridgeName: this.bridgeName,
          role: this.role,
        },
      }, 'Failed to update audio constraint');
    }
  }

  trickleIce() {
    return new Promise((resolve, reject) => {
      try {
        fetchWebRTCMappedStunTurnServers(this.sessionToken)
          .then((iceServers) => {
            const SETTINGS = window.meetingClientSettings;
            const MEDIA = SETTINGS.public.media;
            const SFU_URL = SETTINGS.public.kurento.wsUrl;
            const TRACE_LOGS = SETTINGS.public.kurento.traceLogs;
            const GATHERING_TIMEOUT = SETTINGS.public.kurento.gatheringTimeout;
            const LISTEN_ONLY_OFFERING = MEDIA.listenOnlyOffering;

            const options = {
              clientSessionNumber: getAudioSessionNumber(),
              iceServers,
              offering: LISTEN_ONLY_OFFERING,
              traceLogs: TRACE_LOGS,
              gatheringTimeout: GATHERING_TIMEOUT,
            };

            this.broker = new AudioBroker(
              Auth.authenticateURL(SFU_URL),
              RECV_ROLE,
              options,
            );

            this.broker.onstart = () => {
              const { peerConnection } = this.broker.webRtcPeer;

              if (!peerConnection) return resolve(null);

              const selectedCandidatePair = peerConnection.getReceivers()[0]
                .transport.iceTransport.getSelectedCandidatePair();

              const validIceCandidate = [selectedCandidatePair.local];

              this.broker.stop();
              return resolve(validIceCandidate);
            };

            this.broker.joinAudio().catch(reject);
          });
      } catch (error) {
        // Rollback
        this.exitAudio();
        reject(error);
      }
    });
  }

  exitAudio() {
    const SETTINGS = window.meetingClientSettings;
    const MEDIA = SETTINGS.public.media;
    const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');
    const mediaElement = document.getElementById(MEDIA_TAG);

    this.clearConnectionTimeout();
    this.reconnecting = false;

    if (this.broker) {
      this.broker.stop();
      this.broker = null;
    }

    if (mediaElement && typeof mediaElement.pause === 'function') {
      mediaElement.pause();
      mediaElement.srcObject = null;
    }

    return Promise.resolve();
  }
}
