import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users/index';
import Auth from '/imports/ui/services/auth/index';
import MuteAudioContainer from '../mute-button/container';

export default class JoinAudio extends React.Component {

  renderLeaveButton() {
    return (
      <span>
      <Button
        onClick={this.props.close}
        label={'Leave Audio'}
        color={'danger'}
        icon={'audio'}
        size={'lg'}
        circle={true}
      />
      </span>
    );
  }

  render() {
    if (this.props.isInAudio) {
      return (
        <span>
          <MuteAudioContainer/>
          {this.renderLeaveButton()}
        </span>
      );
    } else if (this.props.isInListenOnly) {
      return this.renderLeaveButton();
    }

    return (
      <Button
        onClick={this.props.open}
        label={'Join Audio'}
        color={'primary'}
        icon={'audio'}
        size={'lg'}
        circle={true}
      />
    );
  }
}
