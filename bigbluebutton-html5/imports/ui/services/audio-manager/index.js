import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import VertoBridge from '/imports/api/2.0/audio/client/bridge/verto';
import SIPBridge from '/imports/api/2.0/audio/client/bridge/sip';

const USE_SIP = Meteor.settings.public.media.useSIPAudio;

const toggleMuteMicrophone = (cb) => {
  cb();
};

// const collection = new Mongo.Collection(null);

class AudioManager {
  constructor() {
    this._inputDevice = {
      tracker: new Tracker.Dependency,
    };

    this.defineProperties({
      isMuted: false,
      isConnected: false,
      isConnecting: false,
      isListenOnly: false,
      isEchoTest: false,
      error: null,
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
          // console.log('set', privateKey, value);
          // this.update(privateKey, value);
        },
        get: () => {
          this[privateKey].tracker.depend();
          return this[privateKey].value;
          // console.log('get', privateKey, collection.findOne({})[privateKey]);
          // return collection.findOne({})[privateKey];
        },
      });
    });

    // return collection.insert(obj);
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
      inputStream: this.inputStream,
    }

    console.log(this.inputStream);
    console.log(this.inputDeviceId);

    return this.bridge.joinAudio(callOptions, this.callStateCallback.bind(this));
  }

  exitAudio() {
    console.log('exitAudio', this);
    return this.bridge.exitAudio()
  }

  toggleMuteMicrophone() {
    console.log('toggleMuteMicrophone', this);
    toggleMuteMicrophone(this.onToggleMicrophoneMute.bind(this));
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

  callStateCallback({ status }) {
    console.log('CALLSTATECALLBACK =====================', status);
    return new Promise((resolve) => {
      const {
        callStarted,
        callEnded,
        callDisconnected,
      } = this.bridge.callStates;

      if (status === callStarted) {
        this.onAudioJoin();
        resolve(callStarted);
      } else if (status === callEnded) {
        this.onAudioExit();
      } else if (status === callDisconnected) {
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
        this._inputDevice.scriptProcessor.connect(this._inputDevice.audioContext.destination);;
      });
  }

  get inputStream () {
    return this._inputDevice.stream;
  }

  get inputDeviceId () {
    return this._inputDevice.id;
  }
  // set outputDeviceId
}

const audioManager = new AudioManager();
export default audioManager;
