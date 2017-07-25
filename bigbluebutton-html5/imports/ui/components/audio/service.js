import Users from '/imports/api/2.0/users';
import Auth from '/imports/ui/services/auth';

import AudioManager from '/imports/api/1.1/audio/client/manager';
import Meetings from '/imports/api/2.0/meetings';

let audioManager;

const init = () => {
  const userId = Auth.userID;
  const User = Users.findOne({ userId });
  const username = User.user.name;
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

  audioManager = new AudioManager(userData);
};

const exitAudio = () => audioManager.exitAudio();
const joinListenOnly = () => audioManager.joinAudio(true);
const joinMicrophone = () => audioManager.joinAudio(false);

export default {
  init,
  exitAudio,
  joinListenOnly,
  joinMicrophone,
};
