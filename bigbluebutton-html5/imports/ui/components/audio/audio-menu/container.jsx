import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import VoiceUsers from '/imports/api/2.0/voice-users';
import Auth from '/imports/ui/services/auth/index';
import JoinAudioOptions from './component';

const JoinAudioOptionsContainer = props => (<JoinAudioOptions {...props} />);

export default createContainer((params) => {
  const userId = Auth.userID;
  const voiceUser = VoiceUsers.findOne({ intId: userId });

  const { joined, listenOnly } = voiceUser;

  return {
    isInAudio: joined,
    isInListenOnly: listenOnly,
    handleJoinAudio: params.handleJoinAudio,
    handleCloseAudio: params.handleCloseAudio,
  };
}, JoinAudioOptionsContainer);
