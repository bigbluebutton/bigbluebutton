import React from 'react';
import PropTypes from 'prop-types';

const propTypes = {
  play: PropTypes.bool.isRequired,
};

class ChatAudioAlert extends React.Component {
  constructor(props) {
    super(props);
    this.audio = new Audio(`${Meteor.settings.public.app.basename}/resources/sounds/notify.mp3`);
    this.handleAudioLoaded = this.handleAudioLoaded.bind(this);
    this.playAudio = this.playAudio.bind(this);
  }

  componentDidMount() {
    this.audio.addEventListener('loadedmetadata', this.handleAudioLoaded);
  }

  componentWillUnmount() {
    this.audio.removeEventListener('loadedmetadata', this.handleAudioLoaded);
  }

  handleAudioLoaded() {
    this.componentDidUpdate = this.playAudio;
  }

  playAudio() {
    const { play } = this.props;
    if (!play) return;
    this.audio.play();
  }

  render() {
    return null;
  }
}
ChatAudioAlert.propTypes = propTypes;

export default ChatAudioAlert;
