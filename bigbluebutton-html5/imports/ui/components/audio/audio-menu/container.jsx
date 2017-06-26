import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Users from '/imports/api/1.1/users/index';
import Auth from '/imports/ui/services/auth/index';
import JoinAudioOptions from './component';

class JoinAudioOptionsContainer extends React.Component {

  render() {
    return (
      <JoinAudioOptions {...this.props} />
    );
  }
}

export default createContainer((params) => {
  const user = Users.findOne({ userId: Auth.userID }).user;

  return {
    isInAudio: user.voiceUser.joined,
    isInListenOnly: user.listenOnly,
    handleJoinAudio: params.handleJoinAudio,
    handleCloseAudio: params.handleCloseAudio,
  };
}, JoinAudioOptionsContainer);
