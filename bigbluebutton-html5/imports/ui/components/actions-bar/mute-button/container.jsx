import React from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import {callServer} from '/imports/ui/services/api';
import Users from '/imports/api/users/index';
import Auth from '/imports/ui/services/auth/index';
import MuteAudio from './component';

class MuteAudioContainer extends React.Component {
  render() {
    return (
      <MuteAudio {...this.props} />
    );
  }
}

export default createContainer((params) => {
  const userId = Auth.userID;
  let user = Users.findOne({ userId });

  let isMuted = false;
  let isInAudio = false;
  let isTalking = false;

  if (user != null && user.user != null && user.user.voiceUser != null) {
    const voiceUser = user.user.voiceUser;
    isMuted = voiceUser.muted;
    isInAudio = voiceUser.joined;
    isTalking = voiceUser.talking;
  }

  let callback = () => {};

  if (isInAudio && !isMuted) {
    callback = () => callServer('muteUser', userId);
  }

  if (isInAudio && isMuted) {
    callback = () => callServer('unmuteUser', userId);
  }

  return {
    isInAudio,
    isMuted,
    callback,
    isTalking,
  };
}, MuteAudioContainer);
