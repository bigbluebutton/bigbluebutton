import React from 'react';
import AudioModal from './audio-modal/component';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';

import { showModal } from '/imports/ui/components/app/service';
import AudioManager from '/imports/api/audio/client/manager';

const handleJoinAudio = () => {
  const handleJoinListenOnly = () => joinListenOnly();
  return showModal(<AudioModal handleJoinListenOnly={handleJoinListenOnly} />);
};

let audioManager = undefined;
const init = () => {
  const userId = Auth.userID;
  const User = Users.findOne({ userId });
  const username = User.user.name;
  const listenOnly = User.user.listenOnly;

  const Meeting = Meetings.findOne(); //TODO test this with Breakouts
  const turns = Meeting.turns;
  const stuns = Meeting.stuns;
  const voiceBridge = Meeting.voiceConf;

  const userData = {
    userId,
    username,
    listenOnly,
    turns,
    stuns,
    voiceBridge,
  };

  audioManager = new AudioManager(userData);
};

let exitAudio = () => audioManager.exitAudio();
let joinListenOnly = () => audioManager.joinAudio(true);
let joinMicrophone = () => audioManager.joinAudio(false);

export {
  init,
  handleJoinAudio,
  exitAudio,
  joinListenOnly,
  joinMicrophone,
};
