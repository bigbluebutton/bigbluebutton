import BaseAudioBridge from '../bridge/base';
import VertoBridge from '../bridge/verto';
import SIPBridge from '../bridge/sip';
import IOSBridge from '../bridge/ios';

// manages audio calls and audio bridges
export default class AudioManager {
  constructor(userData) {
    const MEDIA_CONFIG = Meteor.settings.public.media;

    console.log('user agent', window.navigator.userAgent);
    let audioBridge;
    if (window.navigator.userAgent === 'bbb-webrtc-ios') {
      audioBridge = new IOSBridge(userData);
    } else {
      audioBridge = MEDIA_CONFIG.useSIPAudio ? new SIPBridge(userData) : new VertoBridge(userData);
    }

    if (!(audioBridge instanceof BaseAudioBridge)) {
      throw 'Audio Bridge not compatible';
    }

    this.bridge = audioBridge;
    this.isListenOnly = false;
  }

  exitAudio () {
    this.bridge.exitAudio(this.isListenOnly);
  }

  joinAudio(listenOnly) {
    if (listenOnly) {
      this.isListenOnly = true;
      this.bridge.joinListenOnly();
    } else {
      this.bridge.joinMicrophone();
    }
  }

}
