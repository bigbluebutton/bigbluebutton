import { getVoiceBridge } from '/imports/ui/components/audio/service';
import BaseAudioBridge from './base';

export default class VertoBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    const {
      username,
      voiceBridge,
    } = userData;

    this.voiceBridge = voiceBridge;
    this.vertoUsername = 'FreeSWITCH User - ' + encodeURIComponent(username);
  }

  exitAudio() {
    window.vertoExitAudio();
  }

  joinListenOnly() {
    window.vertoJoinListenOnly(
      'remote-media',
      this.voiceBridge,
      this.vertoUsername,
      null,
    );
  }

  joinMicrophone() {
    window.vertoJoinMicrophone(
      'remote-media',
      this.voiceBridge,
      this.vertoUsername,
      null,
    );
  }

}
