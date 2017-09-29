import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import AudioService from '../service';
import { withModalMounter } from '/imports/ui/components/modal/service';
import EnterAudio from './component';

class EnterAudioContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const {
      isFullAudio,
      mountModal,
    } = this.props;

    const handleJoin = () => {
      mountModal(null);
      return isFullAudio ? AudioService.joinMicrophone() : AudioService.joinListenOnly();
    };

    return (
      <EnterAudio handleJoin={handleJoin} />
    );
  }
}

export default withModalMounter(EnterAudioContainer);
