import BaseAudioBridge from './base';
import Auth from '/imports/ui/services/auth';
import logger from '/imports/startup/client/logger';
import FullAudioBroker from '/imports/ui/services/bbb-webrtc-sfu/fullaudio-broker';
import loadAndPlayMediaStream from '/imports/ui/services/bbb-webrtc-sfu/load-play';
import {
  fetchWebRTCMappedStunTurnServers,
  getMappedFallbackStun,
} from '/imports/utils/fetchStunTurnServers';
import getFromMeetingSettings from '/imports/ui/services/meeting-settings';
import Storage from '/imports/ui/services/storage/session';
import {
  DEFAULT_INPUT_DEVICE_ID,
  DEFAULT_OUTPUT_DEVICE_ID,
  INPUT_DEVICE_ID_KEY,
  OUTPUT_DEVICE_ID_KEY,
  getAudioSessionNumber,
  getAudioConstraints,
} from '/imports/api/audio/client/bridge/service';

const SFU_URL = Meteor.settings.public.kurento.wsUrl;
const MEDIA = Meteor.settings.public.media;
const DEFAULT_FULLAUDIO_MEDIA_SERVER = MEDIA.audio.fullAudioMediaServer;
const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');
const GLOBAL_AUDIO_PREFIX = 'GLOBAL_AUDIO_';
const RECONNECT_TIMEOUT_MS = MEDIA.listenOnlyCallTimeout || 15000;
const SENDRECV_ROLE = 'sendrecv';
const RECV_ROLE = 'recv';
const BRIDGE_NAME = 'fullaudio';

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

const mapErrorCode = (error) => {
  const { errorCode } = error;
  const mappedErrorCode = errorCodeMap[errorCode];
  if (errorCode == null || mappedErrorCode == null) return error;
  // eslint-disable-next-line no-param-reassign
  error.errorCode = mappedErrorCode;
  return error;
};

const getMediaServerAdapter = () => getFromMeetingSettings(
  'media-server-fullaudio',
  DEFAULT_FULLAUDIO_MEDIA_SERVER,
);

export default class FullAudioBridge extends BaseAudioBridge {
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
    this.broker = null;
    this.reconnecting = false;
    this.iceServers = [];
    this.inEchoTest = false;
    this.bridgeName = BRIDGE_NAME;
  }

  get inputDeviceId() {
    const sessionInputDeviceId = Storage.getItem(INPUT_DEVICE_ID_KEY);

    if (sessionInputDeviceId) {
      return sessionInputDeviceId;
    }

    if (this.media.inputDeviceId) {
      return this.media.inputDeviceId;
    }

    return null;
  }

  set inputDeviceId(deviceId) {
    Storage.setItem(INPUT_DEVICE_ID_KEY, deviceId);
    this.media.inputDeviceId = deviceId;
  }

  get outputDeviceId() {
    const sessionOutputDeviceId = Storage.getItem(OUTPUT_DEVICE_ID_KEY);
    if (sessionOutputDeviceId) {
      return sessionOutputDeviceId;
    }

    if (this.media.outputDeviceId) {
      return this.media.outputDeviceId;
    }

    return DEFAULT_OUTPUT_DEVICE_ID;
  }

  set outputDeviceId(deviceId) {
    Storage.setItem(OUTPUT_DEVICE_ID_KEY, deviceId);
    this.media.outputDeviceId = deviceId;
  }

  get inputStream() {
    if (this.broker) {
      return this.broker.getLocalStream();
    }

    return null;
  }

  async setInputStream(stream) {
    try {
      if (this.broker == null) return null;

      await this.broker.setLocalStream(stream);

      return stream;
    } catch (error) {
      logger.warn({
        logCode: 'fullaudio_setinputstream_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          bridgeName: this.bridgeName,
        },
      }, 'Failed to set input stream (mic)');
      return null;
    }
  }

  getPeerConnection() {
    if (!this.broker) return null;

    const { webRtcPeer } = this.broker;
    if (webRtcPeer) return webRtcPeer.peerConnection;
    return null;
  }

  handleTermination() {
    return this.callback({ status: this.baseCallStates.ended, bridge: this.bridgeName });
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
    this.callback({ status: this.baseCallStates.reconnecting, bridge: this.bridgeName });
    this.reconnecting = true;
    // Set up a reconnectionTimeout in case the server is unresponsive
    // for some reason. If it gets triggered, end the session and stop
    // trying to reconnect
    this.reconnectionTimeout = setTimeout(() => {
      this.callback({
        status: this.baseCallStates.failed,
        error: 1010,
        bridgeError: 'Reconnection timeout',
        bridge: this.bridgeName,
      });
      this.broker.stop();
      this.clearReconnectionTimeout();
    }, RECONNECT_TIMEOUT_MS);

    this.joinAudio({ isListenOnly: this.isListenOnly }, this.callback).then(
      () => this.clearReconnectionTimeout(),
    ).catch((error) => {
      // Error handling is a no-op because it will be "handled" in handleBrokerFailure
      logger.debug({
        logCode: 'fullaudio_reconnect_failed',
        extraInfo: {
          errorMessage: error.errorMessage,
          reconnecting: this.reconnecting,
          bridge: this.bridgeName,
        },
      }, 'Fullaudio reconnect failed');
    });
  }

  handleBrokerFailure(error) {
    return new Promise((resolve, reject) => {
      mapErrorCode(error);
      const { errorMessage, errorCause, errorCode } = error;

      if (this.broker.started && !this.reconnecting) {
        logger.error({
          logCode: 'fullaudio_error_try_to_reconnect',
          extraInfo: {
            errorMessage,
            errorCode,
            errorCause,
            bridge: this.bridgeName,
          },
        }, 'Fullaudio failed, try to reconnect');
        this.reconnect();
        return resolve();
      }

      // Already tried reconnecting once OR the user handn't succesfully
      // connected firsthand. Just finish the session and reject with error
      logger.error({
        logCode: 'fullaudio_error',
        extraInfo: {
          errorMessage,
          errorCode,
          errorCause,
          reconnecting: this.reconnecting,
          bridge: this.bridgeName,
        },
      }, 'Fullaudio failed');
      this.clearReconnectionTimeout();
      this.broker.stop();
      this.callback({
        status: this.baseCallStates.failed,
        error: errorCode,
        bridgeError: errorMessage,
        bridge: this.bridgeName,
      });
      return reject(error);
    });
  }

  dispatchAutoplayHandlingEvent(mediaElement) {
    const tagFailedEvent = new CustomEvent('audioPlayFailed', {
      detail: { mediaElement },
    });
    window.dispatchEvent(tagFailedEvent);
    this.callback({ status: this.baseCallStates.autoplayBlocked, bridge: this.bridgeName });
  }

  handleStart() {
    const stream = this.broker.webRtcPeer.getRemoteStream();
    const mediaElement = document.getElementById(MEDIA_TAG);

    return loadAndPlayMediaStream(stream, mediaElement, false).then(() => this
      .callback({
        status: this.baseCallStates.started,
        bridge: this.bridgeName,
      })).catch((error) => {
      // NotAllowedError equals autoplay issues, fire autoplay handling event.
      // This will be handled in audio-manager.
      if (error.name === 'NotAllowedError') {
        logger.error({
          logCode: 'fullaudio_error_autoplay',
          extraInfo: { errorName: error.name, bridge: this.bridgeName },
        }, 'Fullaudio media play failed due to autoplay error');
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
          bridge: this.bridgeName,
        });
        throw normalizedError;
      }
    });
  }

  async _initBrokerEventsPromise() {
    return new Promise((resolve, reject) => {
      try {
        if (!this.broker) resolve(null);

        this.broker.onended = this.handleTermination.bind(this);

        this.broker.onerror = (error) => {
          this.handleBrokerFailure(error).catch(reject);
        };

        this.broker.onstart = () => {
          this.handleStart().then(resolve).catch(reject);
        };
      } catch (error) {
        reject(error);
      }
    });
  }

  async _startBroker(options) {
    try {
      const { isListenOnly, extension } = options;
      this.inEchoTest = !!extension;
      this.isListenOnly = isListenOnly;

      const callerIdName = [
        `${this.userId}_${getAudioSessionNumber()}`,
        'bbbID',
        isListenOnly ? `${GLOBAL_AUDIO_PREFIX}${this.voiceBridge}` : this.name,
      ].join('-').replace(/"/g, "'");

      const brokerOptions = {
        userName: this.name,
        caleeName: callerIdName,
        extension,
        iceServers: this.iceServers,
        mediaServer: getMediaServerAdapter(),
        constraints: getAudioConstraints({ deviceId: this.inputDeviceId }),
      };

      this.broker = new FullAudioBroker(
        Auth.authenticateURL(SFU_URL),
        this.voiceBridge,
        this.userId,
        this.internalMeetingID,
        isListenOnly ? RECV_ROLE : SENDRECV_ROLE,
        brokerOptions,
      );

      const initBrokerEventsPromise = this._initBrokerEventsPromise();

      this.broker.listen();

      return initBrokerEventsPromise;
    } catch (error) {
      logger.warn({ logCode: 'fullaudio_bridge_broker_init_fail' },
        'Problem when initializing SFU broker for fullaudio bridge');
      throw error;
    }
  }

  async joinAudio(options, callback) {
    try {
      this.callback = callback;
      this.iceServers = await fetchWebRTCMappedStunTurnServers(this.sessionToken);
    } catch (error) {
      logger.error({ logCode: 'fullaudio_stun-turn_fetch_failed' },
        'SFU audio bridge failed to fetch STUN/TURN info, using default servers');
      this.iceServers = getMappedFallbackStun();
    } finally {
      await this._startBroker(options);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  async updateAudioConstraints() {
    // TO BE IMPLEMENTED
    return true;
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

  async liveChangeInputDevice(deviceId) {
    try {
      const constraints = {
        audio: getAudioConstraints({ deviceId }),
      };

      this.inputStream.getAudioTracks().forEach((t) => t.stop());
      const updatedStream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.setInputStream(updatedStream);
      this.inputDeviceId = deviceId;

      return updatedStream;
    } catch (error) {
      logger.warn({
        logCode: 'fullaudio_livechangeinputdevice_error',
        extraInfo: {
          errorCode: error.code,
          errorMessage: error.message,
          bridgeName: this.bridgeName,
        },
      }, 'Failed to change input device (mic)');
      return null;
    }
  }

  exitAudio() {
    const mediaElement = document.getElementById(MEDIA_TAG);

    this.broker.stop();
    this.clearReconnectionTimeout();

    if (mediaElement && typeof mediaElement.pause === 'function') {
      mediaElement.pause();
      mediaElement.srcObject = null;
    }

    return Promise.resolve();
  }
}

module.exports = FullAudioBridge;
