import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import MuteAudio from './component';
import MuteAudioService from '../service';

const MuteAudioContainer = props => (<MuteAudio {...props} />);

export default createContainer(() => ({
  toggleSelfVoice: MuteAudioService.toggleSelfVoice,
  voiceUserData: MuteAudioService.getVoiceUserData(),
}), MuteAudioContainer);
