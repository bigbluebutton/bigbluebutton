import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { joinListenOnly, joinMicrophone } from '../service';
import { clearModal } from '/imports/ui/components/app/service';
import EnterAudio from './component';

export default class EnterAudioContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isFullAudio,
    } = this.props;

    let handleJoin = () => {
      clearModal();
      return isFullAudio ? joinMicrophone() : joinListenOnly();
    };

    return (
      <EnterAudio handleJoin={handleJoin} />
    );
  }
}
