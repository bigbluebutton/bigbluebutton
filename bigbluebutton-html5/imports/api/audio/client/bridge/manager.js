import { callServer } from '/imports/ui/services/api';
import BaseAudioBridge from './base';

export default class AudioBridge {
  constructor(audioBridge) {
    if (!(audioBridge instanceof BaseAudioBridge)) {
      throw 'Audio Bridge not compatible';
    }

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
