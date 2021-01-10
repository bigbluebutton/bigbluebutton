import BaseAudioBridge from './base';
import Auth from '/imports/ui/services/auth';
import playAndRetry from '/imports/utils/mediaElementPlayRetry';
import logger from '/imports/startup/client/logger';
import ListenOnlyBroker from '/imports/ui/services/bbb-webrtc-sfu/listenonly-broker';
import loadAndPlayMediaStream from '/imports/ui/services/bbb-webrtc-sfu/load-play';
import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun
} from '/imports/utils/fetchStunTurnServers';

const SFU_URL = Meteor.settings.public.kurento.wsUrl;
const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');
const GLOBAL_AUDIO_PREFIX = 'GLOBAL_AUDIO_';
const RECONNECT_TIMEOUT_MS = MEDIA.listenOnlyCallTimeout || 15000;
const RECV_ROLE = 'recv';
const BRIDGE_NAME = 'kurento';

// SFU's base broker has distinct error codes so that it can be reused by different
// modules. Errors that have a valid, localized counterpart in audio manager are
// mapped so that the user gets a localized error message.
// The ones that haven't (ie SFU's servers-side errors), aren't mapped.
const errorCodeMap = {
  1301: 1001,
  1302: 1002,
  1305: 1005,
  1307: 1007,
}
const mapErrorCode = (error) => {
  const { errorCode } = error;
  const mappedErrorCode = errorCodeMap[errorCode];
  if (errorCode == null || mappedErrorCode == null) return error;
  error.errorCode = mappedErrorCode;
  return error;
}

export default class KurentoAudioBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    this.internalMeetingID = userData.meetingId;
    this.voiceBridge = userData.voiceBridge;
    this.userId = userData.userId;
    this.name = userData.username;
    this.sessionToken = userData.sessionToken;
    this.media = {
      inputDevice: {},
    };
    this.broker;
    this.reconnecting = false;
  }

  async changeOutputDevice(value) {
    const audioContext = document.querySelector(`#${MEDIA_TAG}`);
    if (audioContext.setSinkId) {
      try {
        await audioContext.setSinkId(value);
        this.media.outputDeviceId = value;
      } catch (error) {
        logger.error({
          logCode: 'listenonly_changeoutputdevice_error',
          extraInfo: { error, bridge: BRIDGE_NAME }
        }, 'Audio bridge failed to change output device');
        throw new Error(this.baseErrorCodes.MEDIA_ERROR);
      }
    }

    return this.media.outputDeviceId || value;
  }

  getPeerConnection() {
    const webRtcPeer = this.broker.webRtcPeer;
    if (webRtcPeer) return webRtcPeer.peerConnection;
    return null;
  }

  handleTermination() {
    return this.callback({ status: this.baseCallStates.ended, bridge: BRIDGE_NAME });
  }

  clearReconnectionTimeout() {
    this.reconnecting = false;
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;
    }
  }

  reconnect() {
    this.broker.stop();
    this.callback({ status: this.baseCallStates.reconnecting, bridge: BRIDGE_NAME });
    this.reconnecting = true;
    // Set up a reconnectionTimeout in case the server is unresponsive
    // for some reason. If it gets triggered, end the session and stop
    // trying to reconnect
    this.reconnectionTimeout = setTimeout(() => {
      this.callback({
        status: this.baseCallStates.failed,
        error: 1010,
        bridgeError: 'Reconnection timeout',
        bridge: BRIDGE_NAME,
      });
      this.broker.stop();
      this.clearReconnectionTimeout();
    }, RECONNECT_TIMEOUT_MS);

    this.joinAudio({ isListenOnly: true }, this.callback).then(() => {
      this.clearReconnectionTimeout();
    }).catch(error => {
      // Error handling is a no-op because it will be "handled" in handleBrokerFailure
      logger.debug({
        logCode: 'listenonly_reconnect_failed',
        extraInfo: {
          errorMessage: error.errorMessage,
          reconnecting: this.reconnecting,
          bridge: BRIDGE_NAME
        },
      }, 'Listen only reconnect failed');
    });
  }

  handleBrokerFailure(error) {
    return new Promise((resolve, reject) => {
      mapErrorCode(error);
      const { errorMessage, errorCause, errorCode } = error;

      if (this.broker.started && !this.reconnecting) {
        logger.error({
          logCode: 'listenonly_error_try_to_reconnect',
          extraInfo: { errorMessage, errorCode, errorCause, bridge: BRIDGE_NAME },
        }, 'Listen only failed, try to reconnect');
        this.reconnect();
        return resolve();
      } else {
        // Already tried reconnecting once OR the user handn't succesfully
        // connected firsthand. Just finish the session and reject with error
        logger.error({
          logCode: 'listenonly_error',
          extraInfo: {
            errorMessage, errorCode, errorCause,
            reconnecting: this.reconnecting,
            bridge: BRIDGE_NAME
          },
        }, 'Listen only failed');
        this.clearReconnectionTimeout();
        this.broker.stop();
        this.callback({
          status: this.baseCallStates.failed,
          error: errorCode,
          bridgeError: errorMessage,
          bridge: BRIDGE_NAME,
        });
        return reject(error);
      }
    });
  }

  dispatchAutoplayHandlingEvent(mediaElement) {
    const tagFailedEvent = new CustomEvent('audioPlayFailed', {
      detail: { mediaElement }
    });
    window.dispatchEvent(tagFailedEvent);
    this.callback({ status: this.baseCallStates.autoplayBlocked, bridge: BRIDGE_NAME });
  }

  handleStart() {
    const stream = this.broker.webRtcPeer.getRemoteStream();
    const mediaElement = document.getElementById(MEDIA_TAG);

    return loadAndPlayMediaStream(stream, mediaElement, false).then(() => {
      return this.callback({ status: this.baseCallStates.started, bridge: BRIDGE_NAME });
    }).catch(error => {
      // NotAllowedError equals autoplay issues, fire autoplay handling event.
      // This will be handled in audio-manager.
      if (error.name === 'NotAllowedError') {
        logger.error({
          logCode: 'listenonly_error_autoplay',
          extraInfo: { errorName: error.name, bridge: BRIDGE_NAME },
        }, 'Listen only media play failed due to autoplay error');
        this.dispatchAutoplayHandlingEvent(mediaElement);
      } else {
        const normalizedError = {
          errorCode: 1004,
          errorMessage: error.message || 'AUDIO_PLAY_FAILED',
        };
        this.callback({
          status: this.baseCallStates.failed,
          error: normalizedError.errorCode,
          bridgeError: normalizedError.errorMessage,
          bridge: BRIDGE_NAME,
        })
        throw normalizedError;
      }
    });
  }

  joinAudio({ isListenOnly }, callback) {
    return new Promise(async (resolve, reject) => {
      if (!isListenOnly) return reject(new Error('Invalid bridge option'));
      this.callback = callback;
      let iceServers = [];

      try {
        iceServers = await fetchWebRTCMappedStunTurnServers(this.sessionToken);
      } catch (error) {
        logger.error({ logCode: 'listenonly_stunturn_fetch_failed' },
          'SFU audio bridge failed to fetch STUN/TURN info, using default servers');
        iceServers = getMappedFallbackStun();
      } finally {
        const options = {
          userName: this.name,
          caleeName: `${GLOBAL_AUDIO_PREFIX}${this.voiceBridge}`,
          iceServers,
        };

        this.broker = new ListenOnlyBroker(
          Auth.authenticateURL(SFU_URL),
          this.voiceBridge,
          this.userId,
          this.internalMeetingID,
          RECV_ROLE,
          options,
        );

        this.broker.onended = this.handleTermination.bind(this);
        this.broker.onerror = (error) => {
          this.handleBrokerFailure(error).catch(reject);
        }
        this.broker.onstart = () => {
          this.handleStart().then(resolve).catch(reject);
        };

       this.broker.listen().catch(reject);
      }
    });
  }

  exitAudio() {
    this.broker.stop();
    this.clearReconnectionTimeout();
    return Promise.resolve();
  }
}
