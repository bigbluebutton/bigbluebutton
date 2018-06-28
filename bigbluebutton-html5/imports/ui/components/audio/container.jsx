import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { injectIntl, defineMessages } from 'react-intl';
import _ from 'lodash';
import Breakouts from '/imports/api/breakouts';
import Service from './service';
import AudioModalContainer from './audio-modal/container';

const intlMessages = defineMessages({
  joinedAudio: {
    id: 'app.audioManager.joinedAudio',
    description: 'Joined audio toast message',
  },
  joinedEcho: {
    id: 'app.audioManager.joinedEcho',
    description: 'Joined echo test toast message',
  },
  leftAudio: {
    id: 'app.audioManager.leftAudio',
    description: 'Left audio toast message',
  },
  genericError: {
    id: 'app.audioManager.genericError',
    description: 'Generic error messsage',
  },
  connectionError: {
    id: 'app.audioManager.connectionError',
    description: 'Connection error messsage',
  },
  requestTimeout: {
    id: 'app.audioManager.requestTimeout',
    description: 'Request timeout error messsage',
  },
  invalidTarget: {
    id: 'app.audioManager.invalidTarget',
    description: 'Invalid target error messsage',
  },
  mediaError: {
    id: 'app.audioManager.mediaError',
    description: 'Media error messsage',
  },
  BrowserNotSupported: {
    id: 'app.audioNotification.audioFailedError1003',
    description: 'browser not supported error messsage',
  },
  iceNegotiationError: {
    id: 'app.audioNotification.audioFailedError1007',
    description: 'ice negociation error messsage',
  },
});


class AudioContainer extends React.Component {
  constructor(props) {
    super(props);

    this.init = props.init.bind(this);
  }

  componentDidMount() {
    this.init();
  }

  render() {
    return null;
  }
}

let didMountAutoJoin = false;

export default withModalMounter(injectIntl(withTracker(({ mountModal, intl }) => {
  const APP_CONFIG = Meteor.settings.public.app;

  const { autoJoin } = APP_CONFIG;
  const openAudioModal = mountModal.bind(
    null,
    <AudioModalContainer />,
  );

  Breakouts.find().observeChanges({
    removed() {
      setTimeout(() => openAudioModal(), 0);
    },
  });

  const webRtcError = _.range(1001, 1012)
    .reduce((acc, value) => ({
      ...acc,
      [value]: intl.formatMessage({ id: `app.audioNotification.audioFailedError${value}` }),
    }), {});

  const messages = {
    info: {
      JOINED_AUDIO: intl.formatMessage(intlMessages.joinedAudio),
      JOINED_ECHO: intl.formatMessage(intlMessages.joinedEcho),
      LEFT_AUDIO: intl.formatMessage(intlMessages.leftAudio),
    },
    error: {
      GENERIC_ERROR: intl.formatMessage(intlMessages.genericError),
      CONNECTION_ERROR: intl.formatMessage(intlMessages.connectionError),
      REQUEST_TIMEOUT: intl.formatMessage(intlMessages.requestTimeout),
      INVALID_TARGET: intl.formatMessage(intlMessages.invalidTarget),
      MEDIA_ERROR: intl.formatMessage(intlMessages.mediaError),
      WEBRTC_NOT_SUPPORTED: intl.formatMessage(intlMessages.BrowserNotSupported),
      ICE_NEGOTIATION_FAILED: intl.formatMessage(intlMessages.iceNegotiationError),
      ...webRtcError,
    },
  };

  return {
    init: () => {
      Service.init(messages);
      Service.changeOutputDevice(document.querySelector('#remote-media').sinkId);
      if (!autoJoin || didMountAutoJoin) return;
      openAudioModal();
      didMountAutoJoin = true;
    },
  };
})(AudioContainer)));
