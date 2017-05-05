// import { getVoiceBridge } from '/imports/ui/components/audio/service';
import BaseAudioBridge from './base';

export default class VertoBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    const {
      username,
      voiceBridge,
      userId,
    } = userData;

    this.voiceBridge = voiceBridge;
    this.vertoUsername = `${userId}-bbbID-${username}`;
  }

  exitAudio(listenOnly) {
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
    //alert(this.voiceBridge);
    window.vertoJoinMicrophone(
      'remote-media',
      this.voiceBridge,
      this.vertoUsername,
      null,
    );
  }

}
