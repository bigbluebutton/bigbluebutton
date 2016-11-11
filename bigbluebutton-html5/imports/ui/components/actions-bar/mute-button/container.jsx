import React from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import {callServer} from '/imports/ui/services/api';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users/index';
import Auth from '/imports/ui/services/auth/index';

class MuteAudioContainer extends React.Component {
  muteUser() {
    callServer('muteUser', Auth.userID);
  }

  unmuteUser() {
    callServer('unmuteUser', Auth.userID);
  }

  render() {
    if (this.props.isMuted) {
      return (
        <Button
          onClick={this.unmuteUser}
          label={'Unmute'}
          color={'primary'}
          icon={'audio'}
          size={'lg'}
          circle={true}
        />
      )
    }
    else {
      return (
        <Button
          onClick={this.muteUser}
          label={'Mute'}
          color={'primary'}
          icon={'audio'}
          size={'lg'}
          circle={true}
        />
      )
    }
  }
}

export default createContainer((params) => {
  const data = {
    isMuted: Users.findOne({userId: Auth.userID}).user.voiceUser.muted,
 };
  return data;
}, MuteAudioContainer);
