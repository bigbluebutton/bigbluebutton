import BaseAudioBridge from './base';

const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');

export default class KurentoAudioBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    const {
      userId,
      username,
      voiceBridge,
      internalMeetingID,
    } = userData;

    this.user = {
      userId,
      name: username,
    };

    this.internalMeetingID = voiceBridge;
    this.voiceBridge = voiceBridge;
  }

  exitAudio(listenOnly) {
    window.kurentoExitAudio();
  }

  joinAudio({ isListenOnly }, callback) {
    return new Promise((resolve, reject) => {
      this.callback = callback;
      const onSuccess = ack => resolve(this.callback({ status: this.baseCallStates.started }));

      const onFail = error => resolve(this.callback({
        status: this.baseCallStates.failed,
        error: this.baseErrorCodes.CONNECTION_ERROR,
        bridgeError: error,
      }));

      if (!isListenOnly) {
        return reject("Invalid bridge option");
      }

      window.kurentoJoinAudio(
        MEDIA_TAG,
        this.voiceBridge,
        this.user.userId,
        this.internalMeetingID,
        onFail,
        null,
        this.user.name,
        `GLOBAL_AUDIO_${this.voiceBridge}`,
        onSuccess,
      );
    });
  }

  exitAudio() {
    return new Promise((resolve, reject) => {
      window.kurentoExitAudio();
      return resolve(this.callback({ status: this.baseCallStates.ended }));
    });
  }
}
