import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import VertoBridge from '/imports/api/2.0/audio/client/bridge/verto';
import SIPBridge from '/imports/api/2.0/audio/client/bridge/sip';

const USE_SIP = Meteor.settings.public.media.useSIPAudio;

const ERROR_CODES = {
  REQUEST_TIMEOUT: {
    message: 'Request Timeout',
  },
  CONNECTION_ERROR: {
    message: 'Connection Error',
  },
  ERROR: {
    message: 'An Error Occurred',
  },
};

const OUTPUT_TAG = '#remote-media';

const CALL_STATES = {
  STARTED: 'started',
  ENDED: 'ended',
  FAILED: 'failed',
};

class AudioManager {
  constructor() {
    this._inputDevice = {
      tracker: new Tracker.Dependency,
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        const deviceLabel = stream.getAudioTracks()[0].label;
        navigator.mediaDevices.enumerateDevices().then(devices => {
          const device = devices.find(device => device.label === deviceLabel);
          this.changeInputDevice(device.deviceId);
        })
      });


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
        tracker: new Tracker.Dependency,
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

  joinAudio(options = {}, callbacks = {}) {
    const {
      isListenOnly,
      isEchoTest,
    } = options;

    console.log('joinAudio', this, isListenOnly);
    this.isConnecting = true;
    this.isListenOnly = isListenOnly;
    this.isEchoTest = isEchoTest;
    this.callbacks = callbacks;

    const callOptions = {
      isListenOnly,
      extension: isEchoTest ? '9196' : null,
      inputStream: isListenOnly ? this.createListenOnlyStream() : this.inputStream,
    }

    console.log(callOptions.inputStream);
    console.log(this.inputDeviceId);

    return this.bridge.joinAudio(callOptions, this.callStateCallback.bind(this));
  }

  exitAudio() {
    console.log('exitAudio', this);
    return this.bridge.exitAudio()
  }

  toggleMuteMicrophone() {
    console.log('toggleMuteMicrophone', this);
    makeCall('toggleSelfVoice').then((res) => {
      console.log(res);
      this.onToggleMicrophoneMute();
    });
  }

  callbackToAudioBridge(message) {
    console.log('This is the Manager Callback', message);
  }

  //----------------------------

  onAudioJoin() {
    if (!this.isEchoTest) {
      this.isConnected = true;
    }
    this.isConnecting = false;

    if (this.isListenOnly) {
      makeCall('listenOnlyToggle', true);
    }

    console.log('onAudioJoin', this);
  }

  onAudioExit() {
    this.isConnected = false;
    this.isConnecting = false;

    if (this.isListenOnly) {
      makeCall('listenOnlyToggle', false);
    } else if (this.isEchoTest) {
      this.isEchoTest = false;
    }

    console.log('onAudioExit', this);
  }

  onToggleMicrophoneMute() {
    this.isMuted = !this.isMuted;
    console.log('onToggleMicrophoneMute', this);
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

      console.log('CALLSTATECALLBACK =====================', response);

      if (status === STARTED) {
        this.onAudioJoin();
        resolve(STARTED);
      } else if (status === ENDED) {
        console.log('ENDED');
        this.onAudioExit();
      } else if (status === FAILED) {
        console.log('FAILED');
        this.onAudioExit();
      }
    })
  }

  set userData(value) {
    console.log('set user data');
    this._userData = value;
    this.bridge = USE_SIP ? new SIPBridge(value) : new VertoBridge(value);
  }

  get userData() {
    return this._userData;
  }

  createListenOnlyStream() {
    if (this.listenOnlyAudioContext) {
      this.listenOnlyAudioContext.close();
    }

    this.listenOnlyAudioContext = new window.AudioContext;
    return this.listenOnlyAudioContext.createMediaStreamDestination().stream;
  }

  changeInputDevice(value) {
    if(this._inputDevice.audioContext) {
      this._inputDevice.audioContext.close().then(() => {
        this._inputDevice.audioContext = null;
        this._inputDevice.scriptProcessor = null;
        this._inputDevice.source = null;

        this.changeInputDevice(value);
      });
      return;
    }

    console.log(value);
    this._inputDevice.id = value;
    this._inputDevice.audioContext = new AudioContext();
    this._inputDevice.scriptProcessor = this._inputDevice.audioContext.createScriptProcessor(2048, 1, 1);
    this._inputDevice.source = null;

    const constraints = {
      audio: {
        deviceId: value,
      },
    };

    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        console.log('KAPPA', stream);
        this._inputDevice.stream = stream
        this._inputDevice.source = this._inputDevice.audioContext.createMediaStreamSource(stream);
        this._inputDevice.source.connect(this._inputDevice.scriptProcessor);
        this._inputDevice.scriptProcessor.connect(this._inputDevice.audioContext.destination);
        this._inputDevice.tracker.changed();
      });
  }

  changeOutputDevice(deviceId) {
    this.outputDeviceId = deviceId;
    document.querySelector(OUTPUT_TAG).setSinkId(deviceId);
    console.log('Change id');
  }

  get inputStream () {
    return this._inputDevice.stream;
  }

  get inputDeviceId () {
    this._inputDevice.tracker.depend();
    return this._inputDevice.id;
  }
}

const audioManager = new AudioManager();
export default audioManager;
