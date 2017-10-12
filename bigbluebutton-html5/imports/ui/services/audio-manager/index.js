import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import VertoBridge from '/imports/api/audio/client/bridge/verto';
import SIPBridge from '/imports/api/audio/client/bridge/sip';

const USE_SIP = Meteor.settings.public.media.useSIPAudio;
const OUTPUT_TAG = Meteor.settings.public.media.mediaTag;

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

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const deviceLabel = stream.getAudioTracks()[0].label;
        navigator.mediaDevices.enumerateDevices().then((devices) => {
          const device = devices.find(d => d.label === deviceLabel);
          this.changeInputDevice(device.deviceId);
        });
      }).catch((err) => { this.error = err; });


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

  init(userData) {
    this.bridge = USE_SIP ? new SIPBridge(userData) : new VertoBridge(userData);
    this.userData = userData;
  }

  joinAudio(options = {}, callbacks = {}) {
    const {
      isListenOnly,
      isEchoTest,
    } = options;

    this.isConnecting = true;
    this.error = null;
    this.isListenOnly = isListenOnly || false;
    this.isEchoTest = isEchoTest || false;
    this.callbacks = callbacks;

    const callOptions = {
      isListenOnly: this.isListenOnly,
      extension: isEchoTest ? '9196' : null,
      inputStream: this.isListenOnly ? this.createListenOnlyStream() : this.inputStream,
    };

    // if (this.isListenOnly) makeCall('listenOnlyToggle', true);

    return this.bridge.joinAudio(callOptions, this.callStateCallback.bind(this));
  }

  exitAudio() {
    console.log('LOL');
    return this.bridge.exitAudio();
  }

  transferCall() {
    return this.bridge.transferCall(this.onTransferStart.bind(this), this.onAudioJoin.bind(this));
  }

  toggleMuteMicrophone() {
    makeCall('toggleSelfVoice').then(() => {
      this.onToggleMicrophoneMute();
    });
  }

  onAudioJoin() {
    if (!this.isEchoTest) {
      this.isConnected = true;
    }

    if (this.isListenOnly) makeCall('listenOnlyToggle', true);
    console.log('joined', this.isListenOnly);

    this.isConnecting = false;
  }

  onTransferStart() {
    this.isEchoTest = false;
    this.isConnecting = true;
  }

  onAudioExit() {
    this.isConnected = false;
    this.isConnecting = false;

    if (this.isListenOnly) makeCall('listenOnlyToggle', false);

    if (this.isEchoTest) {
      this.isEchoTest = false;
    }
  }

  onToggleMicrophoneMute() {
    this.isMuted = !this.isMuted;
  }

  //---------------------------
  // update(key, value) {
  //   const query = { _id: this.stateId };
  //   const modifier = { $set: { [key]: value }};
  //   collection.update(query, modifier);
  // }

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
        console.log('error happened');
        this.error = error;
        this.onAudioExit();
      }
    });
  }

  set userData(value) {
    this._userData = value;
  }

  get userData() {
    return this._userData;
  }

  createListenOnlyStream() {
    if (this.listenOnlyAudioContext) {
      this.listenOnlyAudioContext.close();
    }

    if ('webkitAudioContext' in window) {
      this.listenOnlyAudioContext = new window.webkitAudioContext();
    } else {
      this.listenOnlyAudioContext = new window.AudioContext();
    }

    return this.listenOnlyAudioContext.createMediaStreamDestination().stream;
  }

  changeInputDevice(value) {
    if (this._inputDevice.audioContext) {
      this._inputDevice.audioContext.close().then(() => {
        this._inputDevice.audioContext = null;
        this._inputDevice.scriptProcessor = null;
        this._inputDevice.source = null;

        this.changeInputDevice(value);
      });
      return;
    }

    this._inputDevice.id = value;
    if ('webkitAudioContext' in window) {
      this._inputDevice.audioContext = new window.webkitAudioContext();
    } else {
      this._inputDevice.audioContext = new AudioContext();
    }
    this._inputDevice.scriptProcessor = this._inputDevice.audioContext
                                            .createScriptProcessor(2048, 1, 1);
    this._inputDevice.source = null;

    const constraints = {
      audio: {
        deviceId: value,
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        this._inputDevice.stream = stream;
        this._inputDevice.source = this._inputDevice.audioContext.createMediaStreamSource(stream);
        this._inputDevice.source.connect(this._inputDevice.scriptProcessor);
        this._inputDevice.scriptProcessor.connect(this._inputDevice.audioContext.destination);
        this._inputDevice.tracker.changed();
      });
  }

  changeOutputDevice(deviceId) {
    this.outputDeviceId = deviceId;
    document.querySelector(OUTPUT_TAG).setSinkId(deviceId);
  }

  get inputStream() {
    return this._inputDevice.stream;
  }

  get inputDeviceId() {
    this._inputDevice.tracker.depend();
    return this._inputDevice.id;
  }
}

const audioManager = new AudioManager();
export default audioManager;
