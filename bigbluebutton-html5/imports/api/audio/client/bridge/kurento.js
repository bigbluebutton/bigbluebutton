import BaseAudioBridge from './base';
import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import { log } from '/imports/ui/services/api';

const SFU_URL = Meteor.settings.public.kurento.wsUrl;
const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');
const GLOBAL_AUDIO_PREFIX = 'GLOBAL_AUDIO_'

export default class KurentoAudioBridge extends BaseAudioBridge {
  constructor(userData) {
    super();
    const {
      userId,
      username,
      voiceBridge,
      meetingId,
      sessionToken,
    } = userData;

    this.user = {
      userId,
      name: username,
      sessionToken
    };

    this.internalMeetingID = meetingId;
    this.voiceBridge = voiceBridge;
  }

  exitAudio(listenOnly) {
    window.kurentoExitAudio();
  }

  joinAudio({ isListenOnly }, callback) {
    return new Promise(async (resolve, reject) => {
      this.callback = callback;
      let iceServers = [];

      try {
        iceServers = await fetchWebRTCMappedStunTurnServers(this.user.sessionToken);
      } catch (error) {
        log('error', 'SFU audio bridge failed to fetch STUN/TURN info, using default');
      } finally {
        console.log("iceServers", iceServers);
        const options = {
          wsUrl: SFU_URL,
          userName: this.user.name,
          caleeName: `${GLOBAL_AUDIO_PREFIX}${this.voiceBridge}`,
          iceServers,
        };

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
          onSuccess,
          options
        );
      }
    });
  }

  exitAudio() {
    return new Promise((resolve, reject) => {
      window.kurentoExitAudio();
      return resolve(this.callback({ status: this.baseCallStates.ended }));
    });
  }
}
