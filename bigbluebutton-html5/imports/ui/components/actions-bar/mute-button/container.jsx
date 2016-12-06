import React from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import {callServer} from '/imports/ui/services/api';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users/index';
import Auth from '/imports/ui/services/auth/index';
import MuteAudioComponent from './component';

class MuteAudioContainer extends React.Component {
  render() {
    return (
      <MuteAudioComponent
        isInAudio = {this.props.isInAudio}
        isMuted = {this.props.isMuted}
        muteUser = {this.props.muteUser}
        unmuteUser = {this.props.unmuteUser}
        disabledCallback = {this.props.disabledCallback}
      />
    );
  }
}

export default createContainer((params) => {
  const userId = Auth.userID;
  const user = Users.findOne({ userId: userId }).user;
  const data = {
    isInAudio: user.voiceUser.joined,
    isMuted: user.voiceUser.muted,
    muteUser: () => callServer('muteUser', userId),
    unmuteUser: () => callServer('unmuteUser', userId),
    disabledCallback: () => {},
  };
  return data;
}, MuteAudioContainer);
