import { Component } from 'react';
import PropTypes from 'prop-types';
import AudioService from '/imports/ui/components/audio/service';

const propTypes = {
  play: PropTypes.bool.isRequired,
};

class ChatAudioAlert extends Component {
  constructor(props) {
    super(props);
    this.handleAudioLoaded = this.handleAudioLoaded.bind(this);
    this.playAudio = this.playAudio.bind(this);
  }

  componentDidMount() {
    this.handleAudioLoaded();
  }

  componentWillUnmount() {
    this.handleAudioLoaded();
  }

  handleAudioLoaded() {
    this.componentDidUpdate = this.playAudio;
  }

  playAudio() {
    const { play } = this.props;
    if (!play) return;
    AudioService.playAlertSound(`${Meteor.settings.public.app.cdn
      + Meteor.settings.public.app.basename}`
      + '/resources/sounds/notify.mp3');
  }

  render() {
    return null;
  }
}
ChatAudioAlert.propTypes = propTypes;

export default ChatAudioAlert;
