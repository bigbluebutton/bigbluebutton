import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Audio from './component';

import { showModal } from '../app/service';
import AudioModalContainer from './audio-modal/container'

class AudioContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    const APP_CONFIG = Meteor.settings.public.app;

    if (APP_CONFIG.autoJoinAudio) {
      showModal(<AudioModalContainer />);
    }
  }

  render() {
    return (
      <audio id="remote-media" autoPlay="autoplay">
        <Audio
          {...this.props}>
          {this.props.children}
        </Audio>
      </audio>
    );
  }
}

export default createContainer(() => {

  return {
  };
}, AudioContainer);
