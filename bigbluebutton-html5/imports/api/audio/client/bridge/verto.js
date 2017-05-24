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
    let callerIdName = "GLOBAL_AUDIO_" + this.voiceBridge;
    //let callerIdName = this.vertoUsername;
    console.log('callerIdName=' + callerIdName);

    window.vertoJoinListenOnly(
      'remote-media',
      this.voiceBridge,
      callerIdName,
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
