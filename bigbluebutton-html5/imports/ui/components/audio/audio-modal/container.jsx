import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
// import AudioControls from './component';
// import AudioModal from '../audio-modal/component';
import AudioModal from './component';
import Service from '../service';

// const propTypes = {
//   children: PropTypes.element,
// };
//
// const defaultProps = {
//   children: null,
// };

const AudioModalContainer = props => <AudioModal {...props} />;

export default withModalMounter(createContainer(({ mountModal }) => {
  // const APP_CONFIG = Meteor.settings.public.app;
  //
  // const { autoJoinAudio } = APP_CONFIG;
  // const { isConnected, isConnecting, isListenOnly } = Service.getStats();
  // let shouldShowMute = isConnected && !isListenOnly;
  // let shouldShowUnmute = isConnected && !isListenOnly && isMuted;
  // let shouldShowJoin = !isConnected;

  return {
    closeModal: () => mountModal(null),
    joinMicrophone: () => {
      Service.exitAudio().then(() => Service.joinMicrophone())
                         .then(() => mountModal(null));
    },
    joinListenOnly: () => {
      Service.joinMicrophone().then(a => mountModal(null))
    },
    joinEchoTest: () => Service.joinEchoTest(),
    exitAudio: () => Service.exitAudio(),
    isConnecting: Service.isConnecting(),
    isConnected: Service.isConnected(),
    isEchoTest: Service.isEchoTest(),
  };
}, AudioModalContainer));

// AudioControlsContainer.propTypes = propTypes;
// AudioControlsContainer.defaultProps = defaultProps;
