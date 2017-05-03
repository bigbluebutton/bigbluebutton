import React from 'react';
import AudioModal from './audio-modal/component';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

import AudioManager from '/imports/api/audio/client/manager';

let audioManager = undefined;
const init = () => {
  const userId = Auth.userID;
  const User = Users.findOne({ userId });
  const username = User.user.name;

  const Meeting = Meetings.findOne(); //TODO test this with Breakouts
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

let exitAudio = () => audioManager.exitAudio();
let joinListenOnly = () => audioManager.joinAudio(true);
let joinMicrophone = () => audioManager.joinAudio(false);

export default {
  init,
  exitAudio,
  joinListenOnly,
  joinMicrophone,
};
