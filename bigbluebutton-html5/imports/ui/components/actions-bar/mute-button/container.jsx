import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import MuteAudio from './component';
import Service from '../service';

const MuteAudioContainer = props => (<MuteAudio {...props} />);

export default createContainer(() => {
  const toggleSelfVoice = Service.toggleSelfVoice;
  const voiceUserData = Service.getVoiceUserData();

  const data = {
    toggleSelfVoice,
    voiceUserData,
  };
  return data;
}, MuteAudioContainer);
