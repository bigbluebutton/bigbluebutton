import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

const propTypes = {
  play: PropTypes.bool.isRequired,
  count: PropTypes.number.isRequired,
};

class ChatAudioNotification extends React.Component {
  constructor(props) {
    super(props);
    this.audio = new Audio('/html5client/resources/sounds/notify.mp3');

    this.handleAudioLoaded = this.handleAudioLoaded.bind(this);
    this.playAudio = this.playAudio.bind(this);
    this.componentDidUpdate = _.debounce(this.playAudio, 2000);
  }

  componentDidMount() {
    this.audio.addEventListener('loadedmetadata', this.handleAudioLoaded);
  }

  shouldComponentUpdate(nextProps) {
    return nextProps.count > this.props.count;
  }

  componentWillUnmount() {
    this.audio.removeEventListener('loadedmetadata', this.handleAudioLoaded);
  }

  handleAudioLoaded() {
    this.componentDidUpdate = _.debounce(this.playAudio, this.audio.duration * 1000);
  }

  playAudio() {
    if (!this.props.play) return;

    this.audio.play();
  }

  render() {
    return null;
  }

}
ChatAudioNotification.propTypes = propTypes;

export default ChatAudioNotification;
