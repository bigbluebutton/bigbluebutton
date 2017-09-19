import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';
import AudioManager from '/imports/ui/services/audio-manager';
import Meetings from '/imports/api/2.0/meetings';

const init = () => {
  console.log('Running audio service init.');
  const userId = Auth.userID;
  const User = Users.findOne({ userId });
  const username = User.name;
  const Meeting = Meetings.findOne({ meetingId: User.meetingId });
  const voiceBridge = Meeting.voiceProp.voiceConf;

  // FIX ME
  const microphoneLockEnforced = false;

  const userData = {
    userId,
    username,
    voiceBridge,
    microphoneLockEnforced,
  };

  AudioManager.userData = userData;
};

export default {
  init,
  exitAudio: () => AudioManager.exitAudio(),
  joinListenOnly: () => AudioManager.joinAudio(true),
  joinMicrophone: () => AudioManager.joinAudio(),
  toggleMuteMicrophone: () => AudioManager.toggleMuteMicrophone(),
  isConnected: () => AudioManager.isConnected,
  isMuted: () => AudioManager.isMuted,
  isConnecting: () => AudioManager.isConnecting,
  isListenOnly: () => AudioManager.isListenOnly,
  inputDeviceId: () => AudioManager.inputDeviceId,
  outputDeviceId: () => AudioManager.outputDeviceId,
};
