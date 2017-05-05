import BaseAudioBridge from '../bridge/base';
import VertoBridge from '../bridge/verto';
import SIPBridge from '../bridge/sip';

// manages audio calls and audio bridges
export default class AudioManager {
  constructor(userData) {
    const MEDIA_CONFIG = Meteor.settings.public.media;
    const audioBridge = MEDIA_CONFIG.useSIPAudio ? new SIPBridge(userData) : new VertoBridge(userData);
    if (!(audioBridge instanceof BaseAudioBridge)) {
      throw 'Audio Bridge not compatible';
    }

    this.bridge = audioBridge;
    this.isListenOnly = false;
    this.microphoneLockEnforced = userData.microphoneLockEnforced;
  }

  exitAudio () {
    this.bridge.exitAudio(this.isListenOnly);
  }

  joinAudio(listenOnly) {
    if (listenOnly || this.microphoneLockEnforced) {
      this.isListenOnly = true;
      this.bridge.joinListenOnly();
    } else {
      this.bridge.joinMicrophone();
    }
  }

  transferToConference() {
    // TODO: transfer from initialized state
    // TODO: transfer from echo test to conference
    // this.bridge.transferToConference();
  }

  getMicId() {
    // Placeholder, will get the microphone ID for switching input device
    // this.bridge.getMicId();
  }

  setMicId() {
    // Placeholder, will set the microphone ID for switching input device
    // this.bridge.setMicId();
  }

  getSpeakerId() {
    // Placeholder, will get the speaker ID for switching output device
    // this.bridge.getSpeakerId();
  }

  setSpeakerId() {
    // Placeholder, will set the speaker ID for switching output device
    // this.bridge.setSpeakerId();
  }

  getActiveMic() {
    // Placeholder, will detect active input hardware
    // this.bridge.getActiveMic();
  }

}

AudioManager.CallStates = class {
  static get init() {
    return "initialized state";
  }
  static get echo() {
    return "do echo test state";
  }
  static get callIntoEcho() {
    return "calling into echo test state";
  }
  static get inEchoTest() {
    return "in echo test state";
  }
  static get joinVoiceConference() {
    return "join voice conference state";
  }
  static get callIntoConference() {
    return "calling into conference state";
  }
  static get inConference() {
    return "in conference state";
  }
  static get transferToConference() {
    return "joining from echo into conference state";
  }
  static get echoTestFailed() {
    return "echo test failed state";
  }
  static get callToListenOnly() {
    return "call to listen only state";
  }
  static get connectToListenOnly() {
    return "connecting to listen only state";
  }
  static get inListenOnly() {
    return "in listen only state";
  }
};
