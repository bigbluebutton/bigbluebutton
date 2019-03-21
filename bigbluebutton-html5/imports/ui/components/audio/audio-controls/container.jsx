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
    case 'get_audio_joined_status': {
      const audioJoinedState = AudioManager.isConnected ? 'joinedAudio' : 'notInAudio';
      this.window.parent.postMessage({ response: audioJoinedState }, '*');
      break;
    }
    case 'c_mute_status': {
      const muteState = AudioManager.isMuted ? 'selfMuted' : 'selfUnmuted';
      this.window.parent.postMessage({ response: muteState }, '*');
      break;
    }
    default: {
      // console.log(e.data);
    }
  }
};

export default withModalMounter(withTracker(({ mountModal }) => ({
  processToggleMuteFromOutside: arg => processToggleMuteFromOutside(arg),
  showMute: Service.isConnected() && !Service.isListenOnly() && !Service.isEchoTest() && !Service.audioLocked(),
  muted: Service.isConnected() && !Service.isListenOnly() && Service.isMuted(),
  inAudio: Service.isConnected() && !Service.isEchoTest(),
  listenOnly: Service.isConnected() && Service.isListenOnly(),
  disable: Service.isConnecting() || Service.isHangingUp(),
  talking: Service.isTalking() && !Service.isMuted(),
  currentUser: Service.currentUser(),
  handleToggleMuteMicrophone: () => Service.toggleMuteMicrophone(),
  handleJoinAudio: () => (Service.isConnected() ? Service.joinListenOnly() : mountModal(<AudioModalContainer />)),
  handleLeaveAudio: () => Service.exitAudio(),
}))(AudioControlsContainer));
