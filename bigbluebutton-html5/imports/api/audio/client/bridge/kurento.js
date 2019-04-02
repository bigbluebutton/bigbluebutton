import BaseAudioBridge from './base';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { fetchWebRTCMappedStunTurnServers } from '/imports/utils/fetchStunTurnServers';
import logger from '/imports/startup/client/logger';

const SFU_URL = Meteor.settings.public.kurento.wsUrl;
const MEDIA = Meteor.settings.public.media;
const MEDIA_TAG = MEDIA.mediaTag.replace(/#/g, '');
const GLOBAL_AUDIO_PREFIX = 'GLOBAL_AUDIO_'

const getUserId = () => Auth.userID;
const getUsername = () => Users.findOne({ userId: getUserId() }).name;

const logFunc = (type, message, options) => {
  const userId = getUserId();
  const userName = getUsername();

  const topic = options.topic || 'audio';

  logger[type]({obj: Object.assign(options, {userId, userName, topic})}, `[${topic}] ${message}`);
};

const modLogger = {
  info: function (message, options = {}) {
    logFunc('info', message, options);
  },
  error: function (message, options = {}) {
    logFunc('error', message, options);
  },
  debug: function (message, options = {}) {
    logFunc('debug', message, options);
  },
  warn: (message, options = {}) => {
    logFunc('warn', message, options);
  },
};

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

    this.media = {
      inputDevice: {},
    };


    this.internalMeetingID = meetingId;
    this.voiceBridge = voiceBridge;
  }

  joinAudio({ isListenOnly, inputStream }, callback) {
    return new Promise(async (resolve, reject) => {
      this.callback = callback;
      let iceServers = [];

      try {
        iceServers = await fetchWebRTCMappedStunTurnServers(this.user.sessionToken);
      } catch (error) {
        logFunc('error', 'SFU audio bridge failed to fetch STUN/TURN info, using default');
      } finally {
        logFunc('info', "iceServers", iceServers);
        const options = {
          wsUrl: Auth.authenticateURL(SFU_URL),
          userName: this.user.name,
          caleeName: `${GLOBAL_AUDIO_PREFIX}${this.voiceBridge}`,
          iceServers,
          logger: modLogger,
          inputStream,
        };

        const onSuccess = ack => {
          const { webRtcPeer } = window.kurentoManager.kurentoAudio;
          if (webRtcPeer) {
            const audioTag = document.getElementById(MEDIA_TAG);
            const stream = webRtcPeer.getRemoteStream();
            audioTag.pause();
            audioTag.srcObject = stream;
            audioTag.muted = false;
            audioTag.play();
          }
          resolve(this.callback({ status: this.baseCallStates.started }));
        };

        const onFail = error => {
          const { reason } = error;
          this.callback({
            status: this.baseCallStates.failed,
            error: this.baseErrorCodes.CONNECTION_ERROR,
            bridgeError: reason,
          })

          reject(reason);
        };

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

  async changeOutputDevice(value) {
    const audioContext = document.querySelector('#'+MEDIA_TAG);
    if (audioContext.setSinkId) {
      try {
        await audioContext.setSinkId(value);
        this.media.outputDeviceId = value;
      } catch (err) {
        logger.error({ logCode: 'audio_kurento_changeoutputdevice_error' }, err);
        throw new Error(this.baseErrorCodes.MEDIA_ERROR);
      }
    }

    return this.media.outputDeviceId || value;
  }


  exitAudio() {
    return new Promise((resolve, reject) => {
      window.kurentoExitAudio();
      return resolve(this.callback({ status: this.baseCallStates.ended }));
    });
  }
}
