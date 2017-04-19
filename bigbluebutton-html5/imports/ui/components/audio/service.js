import React from 'react';
import AudioModal from './audio-modal/component';
import Meetings from '/imports/api/meetings';

import { showModal } from '/imports/ui/components/app/service';
import AudioManager from '/imports/api/audio/client/manager'

const handleJoinAudio = () => {
  const handleJoinListenOnly = () => joinListenOnly();
  return showModal(<AudioModal handleJoinListenOnly={handleJoinListenOnly} />);
};

const getVoiceBridge = () => {
  return Meetings.findOne({}).voiceConf;
} ;

let audioManager = undefined;
const init = () => {
  audioManager = new AudioManager();
};

console.log('audioBridge1=', audioManager);

let exitAudio = () => audioManager.exitAudio();
let joinListenOnly = () => audioManager.joinAudio(true);
let joinMicrophone = () => audioManager.joinAudio(false);

export {
  init,
  handleJoinAudio,
  getVoiceBridge,
  exitAudio,
  joinListenOnly,
  joinMicrophone,
};
