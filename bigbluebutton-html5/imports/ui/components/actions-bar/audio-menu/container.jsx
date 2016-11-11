import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users/index';
import Auth from '/imports/ui/services/auth/index';
import MuteAudioContainer from '../mute-button/container';

class JoinAudioContainer extends React.Component {

  getLeaveButton() {
    return (
      <span>
      <Button
        onClick={this.props.close}
        label={'Leave Audio'}
        color={'primary'}
        icon={'audio'}
        size={'lg'}
        circle={true}
      />
      </span>
    )
  }

  render() {
    if (this.props.isInAudio) {
      return (
        <span>
          <MuteAudioContainer/>
          {this.getLeaveButton()}
        </span>
      )
    }
    else if (this.props.isInListenOnly) {
      return (
        <span>
          {this.getLeaveButton()}
        </span>
      )
    }
    else {
      return (
        <Button
          onClick={this.props.open}
          label={'Join Audio'}
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
    isInAudio: Users.findOne({userId: Auth.userID}).user.voiceUser.joined,
    isInListenOnly: Users.findOne({userId: Auth.userID}).user.listenOnly,
    open: params.open,
    close: params.close,
 };
  return data;
}, JoinAudioContainer);
