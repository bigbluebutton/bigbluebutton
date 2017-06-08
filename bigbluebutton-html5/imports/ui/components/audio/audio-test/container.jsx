import React, { Component } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import AudioTest from './component';

class AudioTestContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <AudioTest {...this.props}>
        {this.props.children}
      </AudioTest>
    );
  }
}

export default createContainer(() => ({
  handlePlayAudioSample: () => {
    const snd = new Audio('resources/sounds/audioSample.mp3');
    snd.play();
  },
}), AudioTestContainer);
