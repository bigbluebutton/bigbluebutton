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
        isMuted = {this.props.isMuted}
      />
    );
  }
}

export default createContainer((params) => {
  const data = {
    isMuted: Users.findOne({ userId: Auth.userID }).user.voiceUser.muted,
  };
  return data;
}, MuteAudioContainer);
