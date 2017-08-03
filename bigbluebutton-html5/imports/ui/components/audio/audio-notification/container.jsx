import { createContainer } from 'meteor/react-meteor-data';
import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import AudioNotification from './component';
import AudioManager, { AudioErrorCodes } from '/imports/api/2.0/audio/client/manager';

const intlMessages = defineMessages({
  [AudioErrorCodes.CODE_1001]: {
    id: 'app.audioNotification.audioFailedError1001',
    description: 'Audio connection failed with error 1001',
  },
  [AudioErrorCodes.CODE_1002]: {
    id: 'app.audioNotification.audioFailedError1002',
    description: 'Audio connection failed with error 1002',
  },
  [AudioErrorCodes.CODE_1003]: {
    id: 'app.audioNotification.audioFailedError1003',
    description: 'Audio connection failed with error 1003',
  },
  [AudioErrorCodes.CODE_1004]: {
    id: 'app.audioNotification.audioFailedError1004',
    description: 'Audio connection failed with error 1004',
  },
  [AudioErrorCodes.CODE_1005]: {
    id: 'app.audioNotification.audioFailedError1005',
    description: 'Audio connection failed with error 1005',
  },
  [AudioErrorCodes.CODE_1006]: {
    id: 'app.audioNotification.audioFailedError1006',
    description: 'Audio connection failed with error 1006',
  },
  [AudioErrorCodes.CODE_1007]: {
    id: 'app.audioNotification.audioFailedError1007',
    description: 'Audio connection failed with error 1007',
  },
  [AudioErrorCodes.CODE_1008]: {
    id: 'app.audioNotification.audioFailedError1008',
    description: 'Audio connection failed with error 1008',
  },
  [AudioErrorCodes.CODE_1009]: {
    id: 'app.audioNotification.audioFailedError1009',
    description: 'Audio connection failed with error 1009',
  },
  [AudioErrorCodes.CODE_1010]: {
    id: 'app.audioNotification.audioFailedError1010',
    description: 'Audio connection failed with error 1010',
  },
  [AudioErrorCodes.CODE_1011]: {
    id: 'app.audioNotification.audioFailedError1011',
    description: 'Audio connection failed with error 1011',
  },
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

  handleAudioFailure(e) {
    this.message = this.props.messages[e.detail.errorCode];
    if (this.message == null || this.message == undefined) {
      this.message = this.props.audioFailure;
    }
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
  const messages = {};
  messages[AudioErrorCodes.CODE_1001] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1001]);
  messages[AudioErrorCodes.CODE_1002] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1002]);
  messages[AudioErrorCodes.CODE_1003] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1003]);
  messages[AudioErrorCodes.CODE_1004] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1004]);
  messages[AudioErrorCodes.CODE_1005] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1005]);
  messages[AudioErrorCodes.CODE_1006] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1006]);
  messages[AudioErrorCodes.CODE_1007] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1007]);
  messages[AudioErrorCodes.CODE_1008] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1008]);
  messages[AudioErrorCodes.CODE_1009] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1009]);
  messages[AudioErrorCodes.CODE_1010] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1010]);
  messages[AudioErrorCodes.CODE_1011] = intl.formatMessage(intlMessages[AudioErrorCodes.CODE_1011]);
  messages.audioFailure = intl.formatMessage(intlMessages.audioFailed);
  messages.mediaFailure = intl.formatMessage(intlMessages.mediaFailed);

  return { messages };
}, AudioNotificationContainer));
