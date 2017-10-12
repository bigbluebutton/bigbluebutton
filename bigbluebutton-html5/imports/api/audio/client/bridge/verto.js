import BaseAudioBridge from './base';

export default class VertoBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    const {
      userId,
      username,
      voiceBridge,
    } = userData;

    this.voiceBridge = voiceBridge;
    this.vertoUsername = `${userId}-bbbID-${username}`;
  }

  exitAudio(listenOnly) {
    window.vertoExitAudio();
  }

  joinListenOnly() {
    const callerIdName = `GLOBAL_AUDIO_${this.voiceBridge}`;
    console.log(`callerIdName=${callerIdName}`);

    window.vertoJoinListenOnly(
      'remote-media',
      this.voiceBridge,
      callerIdName,
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
