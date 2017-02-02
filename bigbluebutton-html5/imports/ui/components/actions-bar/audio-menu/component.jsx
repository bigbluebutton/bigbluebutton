import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Button from '/imports/ui/components/button/component';
import Users from '/imports/api/users/index';
import Auth from '/imports/ui/services/auth/index';

export default class JoinAudioOptions extends React.Component {

  renderLeaveButton() {
    return (
        <Button
          onClick={this.props.close}
          label={'Leave Audio'}
          color={'danger'}
          icon={'mute'}
          size={'lg'}
          circle={true}
        />
    );
  }

  render() {
    if (this.props.isInAudio || this.props.isInListenOnly) {
      return this.renderLeaveButton();
    }

    return (
      <Button
        onClick={this.props.open}
        label={'Join Audio'}
        color={'primary'}
        icon={'unmute'}
        size={'lg'}
        circle={true}
      />
    );
  }
}
