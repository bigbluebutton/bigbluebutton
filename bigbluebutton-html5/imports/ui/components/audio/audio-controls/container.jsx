import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import AudioManager from '/imports/ui/services/audio-manager';
import { makeCall } from '/imports/ui/services/api';
import AudioControls from './component';
import AudioModalContainer from '../audio-modal/container';
import Service from '../service';

const AudioControlsContainer = props => <AudioControls {...props} />;

const processToggleMuteFromOutside = (e) => {
  switch (e.data) {
    case 'c_mute': {
      makeCall('toggleSelfVoice');
      break;
    }
    case 'c_mute_status': {
      if (!AudioManager.isUsingAudio()) {
        this.window.parent.postMessage({ response: 'notInAudio' }, '*');
        return;
      }
      const muteState = AudioManager.isMuted ? 'selfMuted' : 'selfUnmuted';
      this.window.parent.postMessage({ response: muteState }, '*');
      break;
    }
    default: {
      // console.log(e.data);
    }
  }
};

export default withModalMounter(withTracker(({ mountModal }) =>
  ({
    processToggleMuteFromOutside: arg => processToggleMuteFromOutside(arg),
    mute: Service.isConnected() && !Service.isListenOnly() && !Service.isEchoTest(),
    unmute: Service.isConnected() && !Service.isListenOnly() && Service.isMuted(),
    join: Service.isConnected() && !Service.isEchoTest(),
    disable: Service.isConnecting() || Service.isHangingUp(),
    glow: Service.isTalking() && !Service.isMuted(),
    handleToggleMuteMicrophone: () => Service.toggleMuteMicrophone(),
    handleJoinAudio: () => mountModal(<AudioModalContainer />),
    handleLeaveAudio: () => Service.exitAudio(),
  }))(AudioControlsContainer));
