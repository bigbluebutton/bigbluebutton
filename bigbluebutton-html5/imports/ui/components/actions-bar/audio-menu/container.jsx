import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users/index';
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
  let user = Users.findOne({ userId: Auth.userID });
  let isInAudio = false;
  let isInListenOnly = false;

  if (user != null && user.user != null) {
    user = user.user;
    isInAudio = user.voiceUser.joined;
    isInListenOnly = user.listenOnly;
  }

  return {
    isInAudio,
    isInListenOnly,
    open: params.open,
    close: params.close,
  };
}, JoinAudioOptionsContainer);
