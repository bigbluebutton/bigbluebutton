import BaseAudioBridge from './base';

export default class KurentoAudioBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    const {
      userId,
      username,
      voiceBridge,
      internalMeetingID,
    } = userData;

    this.userId = userId;
    this.userName = username;
    this.internalMeetingID = voiceBridge;
    this.voiceBridge = voiceBridge;
  }

  exitAudio(listenOnly) {
    window.kurentoExitAudio();
  }

  joinAudio({ isListenOnly }) {
    if (!isListenOnly) {
      return;
    }

    window.kurentoJoinAudio(
      'remote-media',
      this.voiceBridge,
      "GLOBAL_AUDIO_" + this.voiceBridge,
      this.internalMeetingID,
      null,
      null,
      null,
      this.userId,
      this.userName,
      null,
    );
  }
}
