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

export default withModalMounter(createContainer(({ mountModal }) =>
  // const APP_CONFIG = Meteor.settings.public.app;
  //
  // const { autoJoinAudio } = APP_CONFIG;
  // const { isConnected, isConnecting, isListenOnly } = Service.getStats();
  // let shouldShowMute = isConnected && !isListenOnly;
  // let shouldShowUnmute = isConnected && !isListenOnly && isMuted;
  // let shouldShowJoin = !isConnected;

   ({
     closeModal: () => mountModal(null),
     joinMicrophone: () => {
       console.log('JOIN MIC FROM CONTAINER');
       Service.exitAudio().then(() => Service.joinMicrophone())
                          .then(() => mountModal(null));
     },
     joinListenOnly: () => {
       Service.joinListenOnly().then(() => mountModal(null))
                               .catch(reason => console.error(reason));
     },

     leaveEchoTest: () => {
       if (!Service.isEchoTest()) {
         return Promise.resolve();
       }
       return Service.exitAudio();
     },
     changeInputDevice: (inputDeviceId) => Service.changeInputDevice(inputDeviceId),
     joinEchoTest: () => Service.joinEchoTest(),
     exitAudio: () => Service.exitAudio(),
     isConnecting: Service.isConnecting(),
     isConnected: Service.isConnected(),
     isEchoTest: Service.isEchoTest(),
     inputDeviceId: Service.inputDeviceId(),
   }), AudioModalContainer));

// AudioControlsContainer.propTypes = propTypes;
// AudioControlsContainer.defaultProps = defaultProps;
