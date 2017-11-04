import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import Meetings from '/imports/api/meetings';

const init = (messages) => {
  const meetingId = Auth.meetingID;
  const userId = Auth.userID;
  const sessionToken = Auth.sessionToken;
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

  AudioManager.init(userData, messages);
};

export default {
  init,
  exitAudio: () => AudioManager.exitAudio(),
  transferCall: () => AudioManager.transferCall(),
  joinListenOnly: () => AudioManager.joinAudio({ isListenOnly: true }),
  joinMicrophone: () => AudioManager.joinAudio(),
  joinEchoTest: () => AudioManager.joinAudio({ isEchoTest: true }),
  toggleMuteMicrophone: () => AudioManager.toggleMuteMicrophone(),
  changeInputDevice: inputDeviceId => AudioManager.changeInputDevice(inputDeviceId),
  changeOutputDevice: outputDeviceId => AudioManager.changeOutputDevice(outputDeviceId),
  isConnected: () => AudioManager.isConnected,
  isHangingUp: () => AudioManager.isHangingUp,
  isMuted: () => AudioManager.isMuted,
  isConnecting: () => AudioManager.isConnecting,
  isListenOnly: () => AudioManager.isListenOnly,
  inputDeviceId: () => AudioManager.inputDeviceId,
  outputDeviceId: () => AudioManager.outputDeviceId,
  isEchoTest: () => AudioManager.isEchoTest,
  error: () => AudioManager.error,
};
