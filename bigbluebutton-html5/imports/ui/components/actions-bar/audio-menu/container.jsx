import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users/index';
import Auth from '/imports/ui/services/auth/index';
import JoinAudioComponent from './component';

class JoinAudioContainer extends React.Component {

  render() {
    return (
      <JoinAudioComponent {...this.props} />
    );
  }
}

export default createContainer((params) => {
  const data = {
    isInAudio: Users.findOne({ userId: Auth.userID }).user.voiceUser.joined,
    isInListenOnly: Users.findOne({ userId: Auth.userID }).user.listenOnly,
    open: params.open,
    close: params.close,
  };
  return data;
}, JoinAudioContainer);
