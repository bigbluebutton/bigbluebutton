import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import Meetings from '/imports/api/meetings';
import mapUser from '/imports/ui/services/user/mapUser';

const init = (messages) => {
  AudioManager.setAudioMessages(messages);
  if (AudioManager.initialized) return;
  const meetingId = Auth.meetingID;
  const userId = Auth.userID;
  const { sessionToken } = Auth;
  const User = Users.findOne({ userId });
  const username = User.name;
  const Meeting = Meetings.findOne({ meetingId: User.meetingId });
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

  AudioManager.init(userData);
};

const audioLocked = () => {
  const userId = Auth.userID;
  const User = mapUser(Users.findOne({ userId }));

  const Meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const audioLock = Meeting.lockSettingsProp.disableMic;

  return audioLock && User.isLocked;
};

export default {
  init,
  exitAudio: () => AudioManager.exitAudio(),
  transferCall: () => AudioManager.transferCall(),
  joinListenOnly: () => AudioManager.joinListenOnly(),
  joinMicrophone: () => AudioManager.joinMicrophone(),
  joinEchoTest: () => AudioManager.joinEchoTest(),
  toggleMuteMicrophone: () => AudioManager.toggleMuteMicrophone(),
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
  isUserModerator: () => Users.findOne({ userId: Auth.userID }).moderator,
  audioLocked,
};
