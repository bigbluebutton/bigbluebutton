import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import Meetings from '/imports/api/2.0/meetings';

const init = () => {
  console.log('Running audio service init.');
  const userId = Auth.userID;
  const sessionToken = Auth.sessionToken;
  const User = Users.findOne({ userId });
  const username = User.name;
  const Meeting = Meetings.findOne({ meetingId: User.meetingId });
  const voiceBridge = Meeting.voiceProp.voiceConf;

  // FIX ME
  const microphoneLockEnforced = false;

  const userData = {
    userId,
    sessionToken,
    username,
    voiceBridge,
    microphoneLockEnforced,
  };

  AudioManager.userData = userData;
};

export default {
  init,
  exitAudio: () => AudioManager.exitAudio(),
  joinListenOnly: () => AudioManager.joinAudio({ isListenOnly: true }),
  joinMicrophone: () => AudioManager.joinAudio(),
  joinEchoTest: () => AudioManager.joinAudio({ isEchoTest: true }),
  toggleMuteMicrophone: () => AudioManager.toggleMuteMicrophone(),
  changeInputDevice: (inputDeviceId) => AudioManager.changeInputDevice(inputDeviceId),
  changeOutputDevice: (outputDeviceId) => AudioManager.changeOutputDevice(outputDeviceId),
  isConnected: () => AudioManager.isConnected,
  isMuted: () => AudioManager.isMuted,
  isConnecting: () => AudioManager.isConnecting,
  isListenOnly: () => AudioManager.isListenOnly,
  inputDeviceId: () => AudioManager.inputDeviceId,
  outputDeviceId: () => AudioManager.outputDeviceId,
  isEchoTest: () => AudioManager.isEchoTest,
};
