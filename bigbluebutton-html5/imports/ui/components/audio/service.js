import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { debounce, throttle } from 'lodash';
import AudioManager from '/imports/ui/services/audio-manager';
import Meetings from '/imports/api/meetings';
import { makeCall } from '/imports/ui/services/api';
import VoiceUsers from '/imports/api/voice-users';
import logger from '/imports/startup/client/logger';
import Storage from '../../services/storage/session';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const TOGGLE_MUTE_THROTTLE_TIME = Meteor.settings.public.media.toggleMuteThrottleTime;
const SHOW_VOLUME_METER = Meteor.settings.public.media.showVolumeMeter;
const {
  enabled: LOCAL_ECHO_TEST_ENABLED,
  initialHearingState: LOCAL_ECHO_INIT_HEARING_STATE,
} = Meteor.settings.public.media.localEchoTest;

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
  if (AudioManager.initialized) return Promise.resolve(false);
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

  return AudioManager.init(userData, audioEventHandler);
};

const muteMicrophone = () => {
  const user = VoiceUsers.findOne({
    meetingId: Auth.meetingID, intId: Auth.userID,
  }, { fields: { muted: 1 } });

  if (!user.muted) {
    logger.info({
      logCode: 'audiomanager_mute_audio',
      extraInfo: { logType: 'user_action' },
    }, 'User wants to leave conference. Microphone muted');
    AudioManager.setSenderTrackEnabled(false);
    makeCall('toggleVoice');
  }
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
  forceExitAudio: () => AudioManager.forceExitAudio(),
  transferCall: () => AudioManager.transferCall(),
  joinListenOnly: () => AudioManager.joinListenOnly(),
  joinMicrophone: () => AudioManager.joinMicrophone(),
  joinEchoTest: () => AudioManager.joinEchoTest(),
  toggleMuteMicrophone: debounce(toggleMuteMicrophone, 500, { leading: true, trailing: false }),
  changeInputDevice: (inputDeviceId) => AudioManager.changeInputDevice(inputDeviceId),
  changeInputStream: (newInputStream) => { AudioManager.inputStream = newInputStream; },
  liveChangeInputDevice: (inputDeviceId) => AudioManager.liveChangeInputDevice(inputDeviceId),
  changeOutputDevice: (outputDeviceId, isLive) => AudioManager.changeOutputDevice(outputDeviceId, isLive),
  isConnectedToBreakout: () => {
    const transferStatus = AudioManager.getBreakoutAudioTransferStatus();
    if (transferStatus.status
      === AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.CONNECTED) return true;
    return false;
  },
  isConnected: () => {
    const transferStatus = AudioManager.getBreakoutAudioTransferStatus();
    if (!!transferStatus.breakoutMeetingId
      && transferStatus.breakoutMeetingId !== Auth.meetingID) return false;
    return AudioManager.isConnected;
  },
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
    { fields: { role: 1 } })?.role === ROLE_MODERATOR,
  isVoiceUser,
  autoplayBlocked: () => AudioManager.autoplayBlocked,
  handleAllowAutoplay: () => AudioManager.handleAllowAutoplay(),
  playAlertSound: (url) => AudioManager.playAlertSound(url),
  updateAudioConstraints:
    (constraints) => AudioManager.updateAudioConstraints(constraints),
  recoverMicState,
  muteMicrophone: () => muteMicrophone(),
  isReconnecting: () => AudioManager.isReconnecting,
  setBreakoutAudioTransferStatus: (status) => AudioManager
    .setBreakoutAudioTransferStatus(status),
  getBreakoutAudioTransferStatus: () => AudioManager
    .getBreakoutAudioTransferStatus(),
  getStats: () => AudioManager.getStats(),
  localEchoEnabled: LOCAL_ECHO_TEST_ENABLED,
  localEchoInitHearingState: LOCAL_ECHO_INIT_HEARING_STATE,
  showVolumeMeter: SHOW_VOLUME_METER,
  notify: (message, error, icon) => { AudioManager.notify(message, error, icon); },
};
