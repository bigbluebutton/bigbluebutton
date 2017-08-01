import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { makeCall } from '/imports/ui/services/api';
import VoiceUsers from '/imports/api/2.0/voice-users';
import Auth from '/imports/ui/services/auth/index';
import MuteAudio from './component';

const MuteAudioContainer = props => (<MuteAudio {...props} />);

export default createContainer(() => {
  const userId = Auth.userID;
  const voiceUser = VoiceUsers.findOne({ intId: userId });

  const { muted, joined, talking } = voiceUser;

  let callback = () => { };

  if (joined && !muted) {
    callback = () => makeCall('muteUser', userId);
  }

  if (joined && muted) {
    callback = () => makeCall('unmuteUser', userId);
  }

  const data = {
    isInAudio: joined,
    isMuted: muted,
    callback,
    isTalking: talking,
  };
  return data;
}, MuteAudioContainer);
