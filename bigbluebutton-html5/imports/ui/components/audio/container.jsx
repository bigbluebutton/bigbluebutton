import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Audio from './component';
import Service from './service';

import {showModal, getModal} from '../app/service';
import AudioModalContainer from './audio-modal/container'

class AudioContainer extends Component {
  constructor(props) {
    super(props);
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

const APP_CONFIG = Meteor.settings.public.app;

if (APP_CONFIG.autoJoinAudio) {
  showModal(<AudioModalContainer />);
}

export default createContainer(() => {

  return {
    modal: getModal(),
  };
}, AudioContainer);


