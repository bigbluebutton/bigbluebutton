import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';

import AudioManager from '/imports/api/1.1/audio/client/manager';

const init = () => {
  const userId = Auth.userID;
  const User = Users.findOne({ userId });
  const username = User.user.name;

  const turns = [];
  const stuns = [];
  // FIX ME
  const voiceBridge = 'Meeting.voiceConf';
  // FIX ME
  const microphoneLockEnforced = 'Meeting.roomLockSettings.disableMic';

  const userData = {
    userId,
    username,
    turns,
    stuns,
    voiceBridge,
    microphoneLockEnforced,
  };

  AudioManager.init(userData);
};

const exitAudio = () => AudioManager.exitAudio();
const joinListenOnly = () => AudioManager.joinAudio(true);
const joinMicrophone = () => AudioManager.joinAudio(false);

export default {
  init,
  exitAudio,
  joinListenOnly,
  joinMicrophone,
};
