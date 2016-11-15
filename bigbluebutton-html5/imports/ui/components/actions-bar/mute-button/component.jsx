import React from 'react';
import {createContainer} from 'meteor/react-meteor-data';
import {callServer} from '/imports/ui/services/api';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users/index';
import Auth from '/imports/ui/services/auth/index';

export default class MuteAudioComponent extends React.Component {
  muteUser() {
    callServer('muteUser', Auth.userID);
  }

  unmuteUser() {
    callServer('unmuteUser', Auth.userID);
  }

  render() {
    const { isMuted } = this.props;
    let onClick = this.muteUser;
    let label = 'Mute';

    if (isMuted) {
      onClick = this.unmuteUser;
      label = 'Unmute';
    }

    return (
      <Button
        onClick={onClick}
        label={label}
        color={'primary'}
        icon={'audio'}
        size={'lg'}
        circle={true}
      />
    );
  }
}
