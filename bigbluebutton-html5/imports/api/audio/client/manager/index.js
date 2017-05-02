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
