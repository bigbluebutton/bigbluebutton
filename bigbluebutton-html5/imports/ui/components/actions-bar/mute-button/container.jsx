import React from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import {callServer} from '/imports/ui/services/api';
import Button from '/imports/ui/components/button/component';
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
  const user = Users.findOne({ userId: userId }).user;
  const isMuted = user.voiceUser.muted;
  const isInAudio = user.voiceUser.joined;
  let callback = () => {};

  if (isInAudio && !isMuted) {
    callback = () => callServer('muteUser', userId);
  }

  if (isInAudio && isMuted) {
    callback = () => callServer('unmuteUser', userId);
  }

  const data = {
    isInAudio,
    isMuted,
    callback,
  };
  return data;
}, MuteAudioContainer);
