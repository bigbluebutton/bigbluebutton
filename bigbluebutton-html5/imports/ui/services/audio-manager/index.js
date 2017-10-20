import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import VertoBridge from '/imports/api/audio/client/bridge/verto';
import SIPBridge from '/imports/api/audio/client/bridge/sip';
import notify from '/imports/ui/components/toast/service';

const MEDIA = Meteor.settings.public.media;
const USE_SIP = MEDIA.useSIPAudio;
const ECHO_TEST_NUMBER = MEDIA.echoTestNumber;

const CALL_STATES = {
  STARTED: 'started',
  ENDED: 'ended',
  FAILED: 'failed',
};

class AudioManager {
  constructor() {
    this._inputDevice = {
      tracker: new Tracker.Dependency(),
    };

    this.defineProperties({
      isMuted: false,
      isConnected: false,
      isConnecting: false,
      isListenOnly: false,
      isEchoTest: false,
      error: null,
      outputDeviceId: null,
    });
  }

  init(userData, messages) {
    this.bridge = USE_SIP ? new SIPBridge(userData) : new VertoBridge(userData);
    this.userData = userData;
    this.messages = messages;
    this.changeInputDevice();
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

  joinAudio(options = {}) {
    const {
      isListenOnly,
      isEchoTest,
    } = options;

    this.isConnecting = true;
    this.isMuted = false;
    this.error = null;
    this.isListenOnly = isListenOnly || false;
    this.isEchoTest = isEchoTest || false;

    const callOptions = {
      isListenOnly: this.isListenOnly,
      extension: isEchoTest ? ECHO_TEST_NUMBER : null,
      inputStream: this.isListenOnly ? this.createListenOnlyStream() : this.inputStream,
    };

    return this.bridge.joinAudio(callOptions, this.callStateCallback.bind(this))
  }

  exitAudio() {
    return this.bridge.exitAudio();
  }

  transferCall() {
    this.onTransferStart();
    return this.bridge.transferCall(this.onAudioJoin.bind(this));
  }

  toggleMuteMicrophone() {
    makeCall('toggleSelfVoice').then(() => {
      this.onToggleMicrophoneMute();
    });
  }

  onAudioJoin() {
    this.isConnecting = false;
    this.isConnected = true;

    if (!this.isEchoTest) {
      notify(this.messages.info.JOINED_AUDIO, 'info', 'audio_on');
    }
  }

  onTransferStart() {
    this.isEchoTest = false;
    this.isConnecting = true;
  }

  onAudioExit() {
    this.isConnected = false;
    this.isConnecting = false;


    if (!this.error && !this.isEchoTest) {
      notify(this.messages.info.LEFT_AUDIO, 'info', 'audio_on');
    }
    this.isEchoTest = false;
  }

  onToggleMicrophoneMute() {
    this.isMuted = !this.isMuted;
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
      } = response;

      if (status === STARTED) {
        this.onAudioJoin();
        resolve(STARTED);
      } else if (status === ENDED) {
        this.onAudioExit();
      } else if (status === FAILED) {
        this.error = error;
        notify(this.messages.error[error], 'error', 'audio_on');
        console.error('Audio Error:', error);
        this.onAudioExit();
      }
    });
  }

  createListenOnlyStream() {
    if (this.listenOnlyAudioContext) {
      this.listenOnlyAudioContext.close();
    }

    this.listenOnlyAudioContext = window.AudioContext ?
                                  new window.AudioContext() :
                                  new window.webkitAudioContext();

    return this.listenOnlyAudioContext.createMediaStreamDestination().stream;
  }

  async changeInputDevice(deviceId) {
    this.inputDevice = await this.bridge.changeInputDevice(deviceId);
  }

  async changeOutputDevice(deviceId) {
    this.outputDeviceId = await this.bridge.changeOutputDevice(deviceId);
  }

  set inputDevice(value) {
    Object.assign(this._inputDevice, value);
    this._inputDevice.tracker.changed();
  }

  get inputStream() {
    return this._inputDevice.stream;
  }

  get inputDeviceId() {
    this._inputDevice.tracker.depend();
    return this._inputDevice.id;
  }

  set userData(value) {
    this._userData = value;
  }

  get userData() {
    return this._userData;
  }
}

const audioManager = new AudioManager();
export default audioManager;
