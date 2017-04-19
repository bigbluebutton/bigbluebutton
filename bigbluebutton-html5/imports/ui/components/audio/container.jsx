import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Audio from './component';

import { showModal } from '../app/service';
import AudioModalContainer from './audio-modal/container'

class AudioContainer extends Component {
  componentWillMount() {
    if (this.props.showJoinAudio) {
      showModal(<AudioModalContainer />);
    }
  }

  render() {
    return (
      <Audio
        {...this.props}>
        {this.props.children}
      </Audio>
    );
  }
}

export default createContainer(() => {
  const APP_CONFIG = Meteor.settings.public.app;

  return {
    showJoinAudio: APP_CONFIG.autoJoinAudio,
  };
}, AudioContainer);
