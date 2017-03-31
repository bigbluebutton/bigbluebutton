import React from 'react';
import AudioModal from './audio-modal/component';
import Meetings from '/imports/api/meetings';

import { showModal } from '/imports/ui/components/app/service';
import AudioManager from '/imports/api/audio/client/bridge'

const handleJoinAudio = () => {
  const handleJoinListenOnly = () => joinListenOnly();
  return showModal(<AudioModal handleJoinListenOnly={handleJoinListenOnly} />);
};

const getVoiceBridge = () => {
  return Meetings.findOne({}).voiceConf;
} ;

let exitAudio = () => AudioManager.exitAudio();
let joinListenOnly = () => AudioManager.joinAudio(true);
let joinMicrophone = () => AudioManager.joinAudio(false);

export {
  handleJoinAudio,
  getVoiceBridge,
  exitAudio,
  joinListenOnly,
  joinMicrophone,
};
