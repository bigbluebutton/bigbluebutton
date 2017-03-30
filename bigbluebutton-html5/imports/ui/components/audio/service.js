import React from 'react';
import AudioModal from './audio-modal/component';
import Meetings from '/imports/api/meetings';

import { showModal } from '/imports/ui/components/app/service';
import AudioAPI from '/imports/api/audio/client/bridge'

const handleJoinAudio = () => {
  const handleJoinListenOnly = () => joinListenOnly();
  return showModal(<AudioModal handleJoinListenOnly={handleJoinListenOnly} />);
};

const getVoiceBridge = () => {
  return Meetings.findOne({}).voiceConf;
} ;

const audioAPI = new AudioAPI();
let exitAudio = () => audioAPI.exitAudio();
let joinListenOnly = () => audioAPI.joinListenOnly();
let joinMicrophone = () => audioAPI.joinMicrophone();

export {
  handleJoinAudio,
  getVoiceBridge,
  exitAudio,
  joinListenOnly,
  joinMicrophone,
};
