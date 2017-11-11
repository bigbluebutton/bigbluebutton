import React from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import MuteToggleBtn from './component';
import Service from '../service';

const MuteToggleBtnContainer = props => <MuteToggleBtn {...props} />;

export default createContainer(() => ({
  disable: Service.isConnecting() || Service.isHangingUp(),
  handleToggleMuteMicrophone: () => Service.toggleMuteMicrophone(),
  mute: Service.isConnected() && !Service.isListenOnly() && !Service.isEchoTest(),
  unmute: Service.isConnected() && !Service.isListenOnly() && Service.isMuted(),
}), MuteToggleBtnContainer);
