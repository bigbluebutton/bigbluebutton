import { callServer } from '/imports/ui/services/api';
import BaseAudioBridge from '../bridge/base';
import VertoBridge from '../bridge/verto';
import SIPBridge from '../bridge/sip';

// manages audio calls and audio bridges
export default class AudioManager {
  constructor() {
    const MEDIA_CONFIG = Meteor.settings.public.media;
    const audioBridge = MEDIA_CONFIG.useSIPAudio ? new SIPBridge() : new VertoBridge();
    if (!(audioBridge instanceof BaseAudioBridge)) {
      throw 'Audio Bridge not compatible';
    }

    console.log('audio manager constructor');
    this.bridge = audioBridge;
  }

  exitAudio () {
    this.bridge.exitAudio();
  }

  joinAudio(listenOnly) {
    if (listenOnly) {
      callServer('listenOnlyToggle', true);
      this.bridge.joinListenOnly();
    } else {
      this.bridge.joinMicrophone();
    }
  }

}
