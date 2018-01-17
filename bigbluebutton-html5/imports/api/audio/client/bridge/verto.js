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

  joinAudio({ isListenOnly }) {
    const vertoJoin = isListenOnly ? 'vertoJoinListenOnly' : 'vertoJoinMicrophone';

    window[vertoJoin](
      'remote-media',
      this.voiceBridge,
      this.vertoUsername,
      null,
    );
  }

}
