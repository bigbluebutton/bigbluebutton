import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { injectIntl, defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import Service from './service';
import Audio from './component';
import AudioModalContainer from './audio-modal/container';

const propTypes = {
  children: PropTypes.element,
};

const defaultProps = {
  children: null,
};

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
});


const AudioContainer = props => <Audio {...props} />;

let didMountAutoJoin = false;

export default withModalMounter(injectIntl(createContainer(({ mountModal, intl }) => {
  const APP_CONFIG = Meteor.settings.public.app;

  const { autoJoinAudio } = APP_CONFIG;

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
    },
  };

  return {
    init: () => {
      Service.init(messages);
      Service.changeOutputDevice(document.querySelector('#remote-media').sinkId);
      if (!autoJoinAudio || didMountAutoJoin) return;
      mountModal(<AudioModalContainer />);
      didMountAutoJoin = true;
    },
  };
}, AudioContainer)));

AudioContainer.propTypes = propTypes;
AudioContainer.defaultProps = defaultProps;
