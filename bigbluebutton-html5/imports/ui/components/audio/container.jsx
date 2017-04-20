import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import Audio from './component';

class AudioContainer extends Component {
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
