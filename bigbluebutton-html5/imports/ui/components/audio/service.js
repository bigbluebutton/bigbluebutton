import React from 'react';
import AudioModal from './audio-modal/component';
import Meetings from '/imports/api/meetings';

import { showModal } from '/imports/ui/components/app/service';
import { joinListenOnly, joinMicrophone,
  exitAudio } from '/imports/api/audio/client/main';

const handleJoinAudio = () => {
  const handleJoinListenOnly = () => joinListenOnly();
  return showModal(<AudioModal handleJoinListenOnly={handleJoinListenOnly} />);
};

const getVoiceBridge = () => {
  return Meetings.findOne({}).voiceConf;
} ;

export {
  handleJoinAudio,
  getVoiceBridge,
  exitAudio,
  joinListenOnly,
  joinMicrophone,
};
