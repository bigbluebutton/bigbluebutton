import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/2.0/voice-users';
import Auth from '/imports/ui/services/auth/index';
import MuteAudio from './component';
import AudioManager from '/imports/ui/services/audio-manager';

const MuteAudioContainer = props => (<MuteAudio {...props} />);

export default createContainer(() => {
  const userId = Auth.userID;
  const voiceUser = VoiceUsers.findOne({ intId: userId });

  const { isConnected, isMuted, toggleMuteMicrophone } = AudioManager;
  const { talking } = voiceUser;

  // const callback = () => makeCall('toggleSelfVoice');

  const data = {
    isConnected: isConnected,
    isMuted: isMuted,
    toggleMuteMicrophone: toggleMuteMicrophone.bind(AudioManager),
    isTalking: talking,
  };
  return data;
}, MuteAudioContainer);
