import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import AudioControls from './component';
import AudioModalContainer from '../audio-modal/container';
import Service from '../service';

const AudioControlsContainer = props => <AudioControls {...props} />;

export default withModalMounter(createContainer(({ mountModal }) =>
   ({
     mute: Service.isConnected() && !Service.isListenOnly() && !Service.isEchoTest(),
     unmute: Service.isConnected() && !Service.isListenOnly() && Service.isMuted(),
     join: Service.isConnected() && !Service.isEchoTest(),
     disable: Service.isConnecting() || Service.isHangingUp(),
     glow: Service.isTalking() && !Service.isMuted(),
     handleToggleMuteMicrophone: () => Service.toggleMuteMicrophone(),
     handleJoinAudio: () => mountModal(<AudioModalContainer />),
     handleLeaveAudio: () => Service.exitAudio(),
   }), AudioControlsContainer));
