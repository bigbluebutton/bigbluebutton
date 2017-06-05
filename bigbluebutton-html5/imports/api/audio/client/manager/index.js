import BaseAudioBridge from '../bridge/base';
import VertoBridge from '../bridge/verto';
import SIPBridge from '../bridge/sip';
import IOSBridge from '../bridge/ios';

// manages audio calls and audio bridges
export default class AudioManager {
  constructor(userData) {
    const MEDIA_CONFIG = Meteor.settings.public.media;

    let audioBridge;
    if (window.navigator.userAgent === 'BigBlueButton') {
      audioBridge = new IOSBridge(userData);
    } else {
      audioBridge = MEDIA_CONFIG.useSIPAudio ? new SIPBridge(userData) : new VertoBridge(userData);
    }

    if (!(audioBridge instanceof BaseAudioBridge)) {
      throw 'Audio Bridge not compatible';
    }

    this.bridge = audioBridge;
    this.isListenOnly = false;
    this.microphoneLockEnforced = userData.microphoneLockEnforced;
  }

  exitAudio() {
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

}
