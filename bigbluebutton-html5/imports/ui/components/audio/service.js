import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import Meetings from '/imports/api/meetings';
import { makeCall } from '/imports/ui/services/api';
import VoiceUsers from '/imports/api/voice-users';
import logger from '/imports/startup/client/logger';
import { throttle } from 'lodash';
import Storage from '../../services/storage/session';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const TOGGLE_MUTE_THROTTLE_TIME = Meteor.settings.public.media.toggleMuteThrottleTime;

const MUTED_KEY = 'muted';

const recoverMicState = () => {
  const muted = Storage.getItem(MUTED_KEY);

  if ((muted === undefined) || (muted === null)) {
    return;
  }

  logger.debug({
    logCode: 'audio_recover_mic_state',
  }, `Audio recover previous mic state: muted = ${muted}`);
  makeCall('toggleVoice', null, muted);
};

const audioEventHandler = (event) => {
  if (!event) {
    return;
  }

  switch (event.name) {
    case 'started':
      if (!event.isListenOnly) recoverMicState();
      break;
    default:
      break;
  }
};

const init = (messages, intl) => {
  AudioManager.setAudioMessages(messages, intl);
  if (AudioManager.initialized) return;
  const meetingId = Auth.meetingID;
  const userId = Auth.userID;
  const { sessionToken } = Auth;
  const User = Users.findOne({ userId }, { fields: { name: 1 } });
  const username = User.name;
  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID }, { fields: { 'voiceProp.voiceConf': 1 } });
  const voiceBridge = Meeting.voiceProp.voiceConf;

  // FIX ME
  const microphoneLockEnforced = false;

  const userData = {
    meetingId,
    userId,
    sessionToken,
    username,
    voiceBridge,
    microphoneLockEnforced,
  };

  AudioManager.init(userData, audioEventHandler);
};

const isVoiceUser = () => {
  const voiceUser = VoiceUsers.findOne({ intId: Auth.userID },
    { fields: { joined: 1 } });
  return voiceUser ? voiceUser.joined : false;
};

const toggleMuteMicrophone = throttle(() => {
  const user = VoiceUsers.findOne({
    meetingId: Auth.meetingID, intId: Auth.userID,
  }, { fields: { muted: 1 } });

  Storage.setItem(MUTED_KEY, !user.muted);

  if (user.muted) {
    logger.info({
      logCode: 'audiomanager_unmute_audio',
      extraInfo: { logType: 'user_action' },
    }, 'microphone unmuted by user');
    makeCall('toggleVoice');
  } else {
    logger.info({
      logCode: 'audiomanager_mute_audio',
      extraInfo: { logType: 'user_action' },
    }, 'microphone muted by user');
    makeCall('toggleVoice');
  }
}, TOGGLE_MUTE_THROTTLE_TIME);

export default {
  init,
  exitAudio: () => AudioManager.exitAudio(),
  transferCall: () => AudioManager.transferCall(),
  joinListenOnly: () => AudioManager.joinListenOnly(),
  joinMicrophone: () => AudioManager.joinMicrophone(),
  joinEchoTest: () => AudioManager.joinEchoTest(),
  toggleMuteMicrophone,
  changeInputDevice: inputDeviceId => AudioManager.changeInputDevice(inputDeviceId),
  changeOutputDevice: outputDeviceId => AudioManager.changeOutputDevice(outputDeviceId),
  isConnected: () => AudioManager.isConnected,
  isTalking: () => AudioManager.isTalking,
  isHangingUp: () => AudioManager.isHangingUp,
  isUsingAudio: () => AudioManager.isUsingAudio(),
  isWaitingPermissions: () => AudioManager.isWaitingPermissions,
  isMuted: () => AudioManager.isMuted,
  isConnecting: () => AudioManager.isConnecting,
  isListenOnly: () => AudioManager.isListenOnly,
  inputDeviceId: () => AudioManager.inputDeviceId,
  outputDeviceId: () => AudioManager.outputDeviceId,
  isEchoTest: () => AudioManager.isEchoTest,
  error: () => AudioManager.error,
  isUserModerator: () => Users.findOne({ userId: Auth.userID },
    { fields: { role: 1 } }).role === ROLE_MODERATOR,
  isVoiceUser,
  autoplayBlocked: () => AudioManager.autoplayBlocked,
  handleAllowAutoplay: () => AudioManager.handleAllowAutoplay(),
  playAlertSound: url => AudioManager.playAlertSound(url),
  updateAudioConstraints:
    constraints => AudioManager.updateAudioConstraints(constraints),
  recoverMicState,
  isReconnecting: () => AudioManager.isReconnecting,
  setBreakoutAudioTransferStatus: status => AudioManager
    .setBreakoutAudioTransferStatus(status),
  getBreakoutAudioTransferStatus: () => AudioManager
    .getBreakoutAudioTransferStatus(),
};
