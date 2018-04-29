import BaseAudioBridge from './base';

const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag;

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

  joinAudio({ isListenOnly }, callback) {
    return new Promise((resolve, reject) => {
      this.callback = callback;
      if (!isListenOnly) {
        return resolve();
      }

      window.kurentoJoinAudio(
        "remote-media",
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

      resolve (this.callback({ status: this.baseCallStates.started }));
    });
  }

  exitAudio() {
    return new Promise((resolve, reject) => {
      window.kurentoExitAudio();
      return resolve (this.callback({status: this.baseCallStates.ended}));
    });
  }
}
