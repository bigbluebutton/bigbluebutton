import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { withModalMounter } from '/imports/ui/components/modal/service';
import AudioControls from './component';
import AudioModal from '../audio-modal/component';
import Service from '../service';

// const propTypes = {
//   children: PropTypes.element,
// };
//
// const defaultProps = {
//   children: null,
// };

const AudioControlsContainer = props => <AudioControls {...props} />;

let didMountAutoJoin = false;

export default withModalMounter(createContainer(({ mountModal }) => {
  // const APP_CONFIG = Meteor.settings.public.app;
  //
  // const { autoJoinAudio } = APP_CONFIG;
  // const { isConnected, isConnecting, isListenOnly } = Service.getStats();
  // let shouldShowMute = isConnected && !isListenOnly;
  // let shouldShowUnmute = isConnected && !isListenOnly && isMuted;
  // let shouldShowJoin = !isConnected;

  return {
    mute: Service.isConnected() && !Service.isListenOnly(),
    unmute: Service.isConnected() && !Service.isListenOnly() && Service.isMuted(),
    join: Service.isConnected(),

    handleToggleMuteMicrophone: () => Service.toggleMuteMicrophone(),
    handleJoinAudio: () => mountModal(<AudioModal handleJoinListenOnly={() => {}} />),
    handleLeaveAudio: () => Service.exitAudio(),
  };
}, AudioControlsContainer));

// AudioControlsContainer.propTypes = propTypes;
// AudioControlsContainer.defaultProps = defaultProps;
