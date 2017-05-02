import React, { Component } from 'react';
import { init } from './service';
import { showModal } from '../app/service';
import AudioModalContainer from './audio-modal/container';

export default class Audio extends Component {
  constructor(props) {
    super(props);
  }

  componentWillMount() {
    if (this.props.showJoinAudio) {
      // window.inAudio = window.inAudio || false;
      if(!window.inAudio) {
        showModal(<AudioModalContainer />);
        window.inAudio = true;
      }
    }
  }

  componentDidMount() {
    init();
  }

  render() {
    return (
      <audio id="remote-media" autoPlay="autoplay">
      </audio>
    );
  }
}
