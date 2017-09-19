import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import JoinAudioOptions from './component';
import AudioManager from '/imports/ui/services/audio-manager';

const JoinAudioOptionsContainer = props => (<JoinAudioOptions {...props} />);

export default createContainer((params) => {
  console.log(AudioManager);
  const { connected, isListenOnly, connecting } = AudioManager;

  return {
    isInAudio: connected,
    isConnecting: connecting,
    isInListenOnly: isListenOnly,
    handleJoinAudio: params.handleJoinAudio,
    handleCloseAudio: params.handleCloseAudio,
  };
}, JoinAudioOptionsContainer);
