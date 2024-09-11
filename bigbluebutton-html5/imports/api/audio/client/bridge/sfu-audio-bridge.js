import BaseAudioBridge from './base';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import AudioBroker from '/imports/ui/services/bbb-webrtc-sfu/audio-broker';
import loadAndPlayMediaStream from '/imports/ui/services/bbb-webrtc-sfu/load-play';
import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun,
} from '/imports/utils/fetchStunTurnServers';
import getFromMeetingSettings from '/imports/ui/services/meeting-settings';
import getFromUserSettings from '/imports/ui/services/users-settings';
import browserInfo from '/imports/utils/browserInfo';
import {
  getAudioSessionNumber,
  getAudioConstraints,
  filterSupportedConstraints,
  doGUM,
} from '/imports/api/audio/client/bridge/service';
import { shouldForceRelay } from '/imports/ui/services/bbb-webrtc-sfu/utils';
import { getRTCStatsLogMetadata } from '/imports/utils/stats';

const SFU_URL = Meteor.settings.public.kurento.wsUrl;
const DEFAULT_LISTENONLY_MEDIA_SERVER = Meteor.settings.public.kurento.listenOnlyMediaServer;
const SIGNAL_CANDIDATES = Meteor.settings.public.kurento.signalCandidates;
const TRACE_LOGS = Meteor.settings.public.kurento.traceLogs;
const GATHERING_TIMEOUT = Meteor.settings.public.kurento.gatheringTimeout;
const MEDIA = Meteor.settings.public.media;
const DEFAULT_FULLAUDIO_MEDIA_SERVER = MEDIA.audio.fullAudioMediaServer;
const RETRY_THROUGH_RELAY = MEDIA.audio.retryThroughRelay || false;
const LISTEN_ONLY_OFFERING = MEDIA.listenOnlyOffering;
const FULLAUDIO_OFFERING = MEDIA.fullAudioOffering;
const TRANSPARENT_LISTEN_ONLY = MEDIA.transparentListenOnly;
const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');
const CONNECTION_TIMEOUT_MS = MEDIA.listenOnlyCallTimeout || 15000;
const { audio: NETWORK_PRIORITY } = MEDIA.networkPriorities || {};
const SENDRECV_ROLE = 'sendrecv';
const RECV_ROLE = 'recv';
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
const RETRYABLE_ERRORS = [1007, 1010];

const mapErrorCode = (error) => {
  const { errorCode } = error;
  const mappedErrorCode = errorCodeMap[errorCode];
  if (errorCode == null || mappedErrorCode == null) return error;
  // eslint-disable-next-line no-param-reassign
  error.errorCode = mappedErrorCode;
  return error;
};

const getMediaServerAdapter = (listenOnly = false) => {
  if (listenOnly) {
    return getFromMeetingSettings(
      'media-server-listenonly',
      DEFAULT_LISTENONLY_MEDIA_SERVER,
    );
  }

  return getFromMeetingSettings(
    'media-server-fullaudio',
    DEFAULT_FULLAUDIO_MEDIA_SERVER,
  );
};

const isTransparentListenOnlyEnabled = () => getFromUserSettings(
  'bbb_transparent_listen_only',
  TRANSPARENT_LISTEN_ONLY,
);

export default class SFUAudioBridge extends BaseAudioBridge {
  static getOfferingRole(isListenOnly) {
    return isListenOnly
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

    this.handleTermination = this.handleTermination.bind(this);
  }

  get inputStream() {
    if (this.broker) {
      return this.broker.getLocalStream();
    }

    return null;
  }

  get role() {
    return this.broker?.role;
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

  async getStatsLogData() {
    try {
      const stats = await this.getStats();

      return getRTCStatsLogMetadata(stats);
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

  // eslint-disable-next-line class-methods-use-this
  mediaStreamFactory(constraints) {
    return doGUM(constraints, true);
  }

  setConnectionTimeout() {
    if (this.connectionTimeout) this.clearConnectionTimeout();

    this.connectionTimeout = setTimeout(() => {
      const error = new Error(`ICE negotiation timeout after ${CONNECTION_TIMEOUT_MS / 1000}s`);
      error.errorCode = 1010;
      // Duplicating key-vals because I can'decide settle on an error pattern - prlanzarin again
      error.errorCause = error.message;
      error.errorMessage = error.message;
      this.handleBrokerFailure(error);
    }, CONNECTION_TIMEOUT_MS);
  }

  clearConnectionTimeout() {
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
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
    // If broker has already started, fire the reconnecting callback so the user
    // knows what's going on
    if (this.broker.started) {
      this.callback({ status: this.baseCallStates.reconnecting, bridge: this.bridgeName });
    } else {
      // Otherwise: override termination handler so the ended callback doesn't get
      // triggered - this is a retry attempt and the user shouldn't be notified
      // yet.
      this.broker.onended = () => {};
    }

    this.broker.stop();
    this.reconnecting = true;
    this._startBroker({ isListenOnly: this.isListenOnly, ...options })
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
      });
  }

  handleBrokerFailure(error) {
    return new Promise((resolve, reject) => {
      this.clearConnectionTimeout();
      mapErrorCode(error);
      const { errorMessage, errorCause, errorCode } = error;

      if (!this.reconnecting) {
        if (this.broker.started) {
          return this.getStatsLogData().then((stats) => {
            logger.error({
              logCode: 'sfuaudio_error_try_to_reconnect',
              extraInfo: {
                errorMessage,
                errorCode,
                errorCause,
                bridge: this.bridgeName,
                role: this.role,
                stats,
              },
            }, 'SFU audio failed, try to reconnect');
            this.reconnect();
            resolve();
          });
        }

        if (RETRYABLE_ERRORS.includes(errorCode) && RETRY_THROUGH_RELAY) {
          return this.getStatsLogData().then((stats) => {
            logger.error({
              logCode: 'sfuaudio_error_retry_through_relay',
              extraInfo: {
                errorMessage,
                errorCode,
                errorCause,
                bridge: this.bridgeName,
                role: this.role,
                stats,
              },
            }, 'SFU audio failed to connect, retry through relay');
            this.reconnect({ forceRelay: true });
            resolve();
          });
        }
      }

      // Already tried reconnecting once OR the user handn't succesfully
      // connected firsthand and retrying isn't an option. Finish the session
      // and reject with the error
      this.clearConnectionTimeout();
      this.getStatsLogData().then((stats) => {
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

        this.broker.stop();
        this.callback({
          status: this.baseCallStates.failed,
          error: errorCode,
          bridgeError: errorMessage,
          bridge: this.bridgeName,
          stats,
        });
        reject(error);
      });
    });
  }

  handleTermination() {
    this.clearConnectionTimeout();
    return this.callback({ status: this.baseCallStates.ended, bridge: this.bridgeName });
  }

  handleStart() {
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

  get clientSessionNumber() {
    return this.broker ? this.broker.clientSessionNumber : null;
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
      } = options;

      const handleInitError = (_error) => {
        mapErrorCode(_error);
        if (RETRYABLE_ERRORS.includes(_error?.errorCode)
          || !RETRY_THROUGH_RELAY
          || this.reconnecting) {
          reject(_error);
        }
      };

      try {
        this.inEchoTest = !!extension;
        this.isListenOnly = isListenOnly;

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
        };

        this.broker = new AudioBroker(
          Auth.authenticateURL(SFU_URL),
          isListenOnly ? RECV_ROLE : SENDRECV_ROLE,
          brokerOptions,
        );

        this.broker.onended = this.handleTermination.bind(this);
        this.broker.onerror = (error) => {
          this.handleBrokerFailure(error).catch(reject);
        };
        this.broker.onstart = () => {
          this.handleStart().then(resolve).catch(reject);
        };

        // Set up a connectionTimeout in case the server or network are botching
        // negotiation or conn checks.
        this.setConnectionTimeout();
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

module.exports = SFUAudioBridge;
