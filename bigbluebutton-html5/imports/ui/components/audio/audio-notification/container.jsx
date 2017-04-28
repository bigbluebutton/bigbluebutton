import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import AudioNotification from './component';

const intlMessages = defineMessages({
  audioFailed: {
    id: 'app.audioNotification.audioFailedMessage',
    description: 'The audio could not connect',
  },
  mediaFailed: {
    id: 'app.audioNotification.mediaFailedMessage',
    description: 'Could not access getUserMicMedia',
  },
});

class AudioNotificationContainer extends Component {
  constructor(props) {
    super(props);

    this.color = null;
    this.message = null;

    this.state = {
      status: null,
    };

    this.handleAudioFailure = this.handleAudioFailure.bind(this);
    this.handleMediaFailure = this.handleMediaFailure.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  componentDidMount() {
    window.addEventListener('bbb.webrtc.failed', this.handleAudioFailure);
    window.addEventListener('bbb.webrtc.mediaFailed', this.handleMediaFailure);
    window.addEventListener('bbb.webrtc.connected', this.handleClose);
  }

  componentWillUnmount() {
    window.removeEventListener('bbb.webrtc.failed', this.handleAudioFailure);
    window.removeEventListener('bbb.webrtc.mediaFailed', this.handleMediaFailure);
    window.removeEventListener('bbb.webrtc.connected', this.handleClose);
  }

  handleClose() {
    this.color = null;
    this.message = null;
    this.setState({ status: null });
  }

  handleAudioFailure() {
    this.message = this.props.audioFailure;
    this.setState({ status: 'failed' });
  }

  handleMediaFailure() {
    this.message = this.props.mediaFailure;
    this.setState({ status: 'failed' });
  }

  render() {
    const handleClose = this.handleClose;
    this.color = 'danger';

    return (
      <AudioNotification
        color={this.color}
        message={this.message}
        handleClose={handleClose}
      />
    );
  }
}

export default injectIntl(createContainer(({ intl }) => {
  let messages = {};
  messages.audioFailure = intl.formatMessage(intlMessages.audioFailed);
  messages.mediaFailure = intl.formatMessage(intlMessages.mediaFailed);
  return messages;
}, AudioNotificationContainer));
