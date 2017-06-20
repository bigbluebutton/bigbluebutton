import React from 'react';
import AudioModal from './audio-modal/component';
import Meetings from '/imports/api/1.1/meetings';
import Users from '/imports/api/1.1/users';
import Auth from '/imports/ui/services/auth';

import AudioManager from '/imports/api/1.1/audio/client/manager';

let audioManager;
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
