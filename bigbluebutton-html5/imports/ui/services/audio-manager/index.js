import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import VertoBridge from '/imports/api/audio/client/bridge/verto';
import KurentoBridge from '/imports/api/audio/client/bridge/kurento';
import Auth from '/imports/ui/services/auth';
import VoiceUsers from '/imports/api/voice-users';
import SIPBridge from '/imports/api/audio/client/bridge/sip';
import logger from '/imports/startup/client/logger';
import { notify } from '/imports/ui/services/notification';
import browser from 'browser-detect';
import iosWebviewAudioPolyfills from '../../../utils/ios-webview-audio-polyfills';
import { tryGenerateIceCandidates } from '../../../utils/safari-webrtc';

const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag;
const USE_SIP = MEDIA.useSIPAudio;
const ECHO_TEST_NUMBER = MEDIA.echoTestNumber;
const MAX_LISTEN_ONLY_RETRIES = 1;

const CALL_STATES = {
  STARTED: 'started',
  ENDED: 'ended',
  FAILED: 'failed',
};

class AudioManager {
  constructor() {
    this._inputDevice = {
      value: 'default',
      tracker: new Tracker.Dependency(),
    };

    this.defineProperties({
      isMuted: false,
      isConnected: false,
      isConnecting: false,
      isHangingUp: false,
      isListenOnly: false,
      isEchoTest: false,
      isTalking: false,
      isWaitingPermissions: false,
      error: null,
      outputDeviceId: null,
      muteHandle: null,
    });

    this.useKurento = Meteor.settings.public.kurento.enableListenOnly;
  }

  init(userData) {
    this.bridge = USE_SIP ? new SIPBridge(userData) : new VertoBridge(userData);
    if (this.useKurento) {
      this.listenOnlyBridge = new KurentoBridge(userData);
    }
    this.userData = userData;
    this.initialized = true;
  }

  setAudioMessages(messages) {
    this.messages = messages;
  }

  defineProperties(obj) {
    Object.keys(obj).forEach((key) => {
      const privateKey = `_${key}`;
      this[privateKey] = {
        value: obj[key],
        tracker: new Tracker.Dependency(),
      };

      Object.defineProperty(this, key, {
        set: (value) => {
          this[privateKey].value = value;
          this[privateKey].tracker.changed();
        },
        get: () => {
          this[privateKey].tracker.depend();
          return this[privateKey].value;
        },
      });
    });
  }

  askDevicesPermissions() {
    // Only change the isWaitingPermissions for the case where the user didnt allowed it yet
    const permTimeout = setTimeout(() => {
      if (!this.devicesInitialized) { this.isWaitingPermissions = true; }
    }, 100);

    this.isWaitingPermissions = false;
    this.devicesInitialized = false;

    return Promise.all([
      this.setDefaultInputDevice(),
      this.setDefaultOutputDevice(),
    ]).then(() => {
      this.devicesInitialized = true;
      this.isWaitingPermissions = false;
    }).catch((err) => {
      clearTimeout(permTimeout);
      this.isConnecting = false;
      this.isWaitingPermissions = false;
      throw err;
    });
  }

  joinMicrophone() {
    this.isListenOnly = false;
    this.isEchoTest = false;

    const callOptions = {
      isListenOnly: false,
      extension: null,
      inputStream: this.inputStream,
    };

    return this.askDevicesPermissions()
      .then(this.onAudioJoining.bind(this))
      .then(() => this.bridge.joinAudio(callOptions, this.callStateCallback.bind(this)));
  }

  joinEchoTest() {
    this.isListenOnly = false;
    this.isEchoTest = true;

    const callOptions = {
      isListenOnly: false,
      extension: ECHO_TEST_NUMBER,
      inputStream: this.inputStream,
    };

    return this.askDevicesPermissions()
      .then(this.onAudioJoining.bind(this))
      .then(() => this.bridge.joinAudio(callOptions, this.callStateCallback.bind(this)));
  }

  async joinListenOnly(retries = 0) {
    this.isListenOnly = true;
    this.isEchoTest = false;
    const { name } = browser();
    // The kurento bridge isn't a full audio bridge yet, so we have to differ it
    const bridge = this.useKurento ? this.listenOnlyBridge : this.bridge;

    const callOptions = {
      isListenOnly: true,
      extension: null,
      inputStream: this.createListenOnlyStream(),
    };

    // Webkit ICE restrictions demand a capture device permission to release
    // host candidates
    if (name === 'safari') {
      try {
        await tryGenerateIceCandidates();
      } catch (e) {
        this.notify(this.messages.error.ICE_NEGOTIATION_FAILED);
      }
    }

    // Call polyfills for webrtc client if navigator is "iOS Webview"
    const userAgent = window.navigator.userAgent.toLocaleLowerCase();
    if ((userAgent.indexOf('iphone') > -1 || userAgent.indexOf('ipad') > -1)
       && userAgent.indexOf('safari') == -1) {
      iosWebviewAudioPolyfills();
    }

    // We need this until we upgrade to SIP 9x. See #4690
    const iceGatheringErr = 'ICE_TIMEOUT';
    const iceGatheringTimeout = new Promise((resolve, reject) => {
      setTimeout(reject, 12000, iceGatheringErr);
    });

    const handleListenOnlyError = async (err) => {
      if (iceGatheringTimeout) {
        clearTimeout(iceGatheringTimeout);
      }

      logger.error('Listen only error:', err, 'on try', retries);
      throw {
        type: 'MEDIA_ERROR',
        message: this.messages.error.MEDIA_ERROR,
      };
    };

    return this.onAudioJoining()
      .then(() => Promise.race([
        bridge.joinAudio(callOptions, this.callStateCallback.bind(this)),
        iceGatheringTimeout,
      ]))
      .catch(async (err) => {
        if (retries < MAX_LISTEN_ONLY_RETRIES) {
          // Fallback to SIP.js listen only in case of failure
          if (this.useKurento) {
            // Exit previous SFU session and clean audio tag state
            window.kurentoExitAudio();
            this.useKurento = false;
            const audio = document.querySelector(MEDIA_TAG);
            audio.muted = false;
          }

          try {
            await this.joinListenOnly(++retries);
          } catch (error) {
            return handleListenOnlyError(error);
          }
        } else {
          handleListenOnlyError(err);
        }
      });
  }

  onAudioJoining() {
    this.isConnecting = true;
    this.isMuted = false;
    this.error = false;

    return Promise.resolve();
  }

  exitAudio() {
    if (!this.isConnected) return Promise.resolve();

    const bridge = (this.useKurento && this.isListenOnly) ? this.listenOnlyBridge : this.bridge;

    this.isHangingUp = true;
    this.isEchoTest = false;

    return bridge.exitAudio();
  }

  transferCall() {
    this.onTransferStart();
    return this.bridge.transferCall(this.onAudioJoin.bind(this));
  }

  toggleMuteMicrophone() {
    makeCall('toggleSelfVoice');
  }

  onAudioJoin() {
    this.isConnecting = false;
    this.isConnected = true;

    // listen to the VoiceUsers changes and update the flag
    if (!this.muteHandle) {
      const query = VoiceUsers.find({ intId: Auth.userID });
      this.muteHandle = query.observeChanges({
        changed: (id, fields) => {
          if (fields.muted !== undefined && fields.muted !== this.isMuted) {
            this.isMuted = fields.muted;
            const muteState = this.isMuted ? 'selfMuted' : 'selfUnmuted';
            window.parent.postMessage({ response: muteState }, '*');
          }

          if (fields.talking !== undefined && fields.talking !== this.isTalking) {
            this.isTalking = fields.talking;
          }

          if (this.isMuted) {
            this.isTalking = false;
          }
        },
      });
    }

    if (!this.isEchoTest) {
      window.parent.postMessage({ response: 'joinedAudio' }, '*');
      this.notify(this.messages.info.JOINED_AUDIO);
    }
  }

  onTransferStart() {
    this.isEchoTest = false;
    this.isConnecting = true;
  }

  onAudioExit() {
    this.isConnected = false;
    this.isConnecting = false;
    this.isHangingUp = false;
    this.isListenOnly = false;

    if (this.inputStream) {
      window.defaultInputStream.forEach(track => track.stop());
      this.inputStream.getTracks().forEach(track => track.stop());
      this.inputDevice = { id: 'default' };
    }

    if (!this.error && !this.isEchoTest) {
      this.notify(this.messages.info.LEFT_AUDIO);
    }
    window.parent.postMessage({ response: 'notInAudio' }, '*');
  }

  callStateCallback(response) {
    return new Promise((resolve) => {
      const {
        STARTED,
        ENDED,
        FAILED,
      } = CALL_STATES;

      const {
        status,
        error,
        bridgeError,
      } = response;

      if (status === STARTED) {
        this.onAudioJoin();
        resolve(STARTED);
      } else if (status === ENDED) {
        this.onAudioExit();
      } else if (status === FAILED) {
        this.error = error;
        this.notify(this.messages.error[error] || this.messages.error.GENERIC_ERROR, true);
        logger.error('Audio Error:', error, bridgeError);
        this.exitAudio();
        this.onAudioExit();
      }
    });
  }

  createListenOnlyStream() {
    if (this.listenOnlyAudioContext) {
      this.listenOnlyAudioContext.close();
    }

    this.listenOnlyAudioContext = window.AudioContext
      ? new window.AudioContext()
      : new window.webkitAudioContext();

    const dest = this.listenOnlyAudioContext.createMediaStreamDestination();

    const audio = document.querySelector(MEDIA_TAG);

    // Play bogus silent audio to try to circumvent autoplay policy on Safari
    audio.src = 'resources/sounds/silence.mp3';

    audio.play().catch((e) => {
      logger.warn('Error on playing test audio:', e);
    });

    return dest.stream;
  }

  isUsingAudio() {
    return this.isConnected || this.isConnecting
      || this.isHangingUp || this.isEchoTest;
  }

  setDefaultInputDevice() {
    return this.changeInputDevice();
  }

  setDefaultOutputDevice() {
    return this.changeOutputDevice('default');
  }

  changeInputDevice(deviceId) {
    const handleChangeInputDeviceSuccess = (inputDevice) => {
      this.inputDevice = inputDevice;
      return Promise.resolve(inputDevice);
    };

    const handleChangeInputDeviceError = () => Promise.reject({
      type: 'MEDIA_ERROR',
      message: this.messages.error.MEDIA_ERROR,
    });

    if (!deviceId) {
      return this.bridge.setDefaultInputDevice()
        .then(handleChangeInputDeviceSuccess)
        .catch(handleChangeInputDeviceError);
    }

    return this.bridge.changeInputDevice(deviceId)
      .then(handleChangeInputDeviceSuccess)
      .catch(handleChangeInputDeviceError);
  }

  async changeOutputDevice(deviceId) {
    this.outputDeviceId = await this.bridge.changeOutputDevice(deviceId);
  }

  set inputDevice(value) {
    this._inputDevice.value = value;
    this._inputDevice.tracker.changed();
  }

  get inputStream() {
    this._inputDevice.tracker.depend();
    return this._inputDevice.value.stream;
  }

  get inputDeviceId() {
    this._inputDevice.tracker.depend();
    return this._inputDevice.value.id;
  }

  set userData(value) {
    this._userData = value;
  }

  get userData() {
    return this._userData;
  }

  notify(message, error = false) {
    notify(
      message,
      error ? 'error' : 'info',
      this.isListenOnly ? 'audio_on' : 'unmute',
    );
  }
}

const audioManager = new AudioManager();
export default audioManager;
