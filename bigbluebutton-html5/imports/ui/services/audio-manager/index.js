import { Tracker } from 'meteor/tracker';
import { makeCall } from '/imports/ui/services/api';
import VertoBridge from '/imports/api/audio/client/bridge/verto';
import KurentoBridge from '/imports/api/audio/client/bridge/kurento';
import Auth from '/imports/ui/services/auth';
import VoiceUsers from '/imports/api/voice-users';
import SIPBridge from '/imports/api/audio/client/bridge/sip';
import { notify } from '/imports/ui/services/notification';

const MEDIA = Meteor.settings.public.media;
const USE_SIP = MEDIA.useSIPAudio;
const USE_KURENTO = Meteor.settings.public.kurento.enableListenOnly;
const ECHO_TEST_NUMBER = MEDIA.echoTestNumber;

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
  }

  init(userData) {
    this.bridge = USE_SIP ? new SIPBridge(userData) : new VertoBridge(userData);
    if (USE_KURENTO) {
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

  joinListenOnly() {
    this.isListenOnly = true;
    this.isEchoTest = false;
    // The kurento bridge isn't a full audio bridge yet, so we have to differ it
    const bridge  = USE_KURENTO? this.listenOnlyBridge : this.bridge;

    const callOptions = {
      isListenOnly: true,
      extension: null,
      inputStream: this.createListenOnlyStream(),
    };

    // We need this until we upgrade to SIP 9x. See #4690
    const iceGatheringErr = 'ICE_TIMEOUT';
    const iceGatheringTimeout = new Promise((resolve, reject) => {
      setTimeout(reject, 12000, iceGatheringErr);
    });

    return this.onAudioJoining()
      .then(() => Promise.race([
        bridge.joinAudio(callOptions, this.callStateCallback.bind(this)),
        iceGatheringTimeout,
      ]))
      .catch((err) => {
        // If theres a iceGathering timeout we retry to join after asking device permissions
        if (err === iceGatheringErr) {
          return this.askDevicesPermissions()
            .then(() => this.joinListenOnly());
        }

        throw err;
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

    const bridge  = (USE_KURENTO && this.isListenOnly) ? this.listenOnlyBridge : this.bridge;

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
        this.notify(this.messages.error[error], true);
        makeCall('failed callStateCallback audio', response);
        console.error('Audio Error:', error, bridgeError);
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

  isUsingAudio() {
    return this.isConnected || this.isConnecting ||
      this.isHangingUp || this.isEchoTest;
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

    const handleChangeInputDeviceError = () =>
      Promise.reject({
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
