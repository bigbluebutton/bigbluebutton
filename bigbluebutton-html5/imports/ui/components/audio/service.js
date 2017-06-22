import React from 'react';
import AudioModal from './audio-modal/component';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

import AudioManager from '/imports/api/audio/client/manager';

const init = () => {
  const userId = Auth.userID;
  const User = Users.findOne({ userId });
  const username = User.user.name;

  const Meeting = Meetings.findOne(); // TODO test this with Breakouts
  const turns = Meeting.turns;
  const stuns = Meeting.stuns;
  const voiceBridge = Meeting.voiceConf;
  const microphoneLockEnforced = Meeting.roomLockSettings.disableMic;

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
