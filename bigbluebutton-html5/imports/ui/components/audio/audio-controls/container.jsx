import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import AudioManager from '/imports/ui/services/audio-manager';
import { makeCall } from '/imports/ui/services/api';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import AudioControls from './component';
import AudioModalContainer from '../audio-modal/container';
import Service from '../service';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;

const AudioControlsContainer = props => <AudioControls {...props} />;

const processToggleMuteFromOutside = (e) => {
  switch (e.data) {
    case 'c_mute': {
      makeCall('toggleVoice');
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

const handleLeaveAudio = () => {
  Service.exitAudio();
  logger.info({
    logCode: 'audiocontrols_leave_audio',
    extraInfo: { logType: 'user_action' },
  }, 'audio connection closed by user');
};

const {
  isVoiceUser,
  isConnected,
  isListenOnly,
  isEchoTest,
  isMuted,
  isConnecting,
  isHangingUp,
  isTalking,
  toggleMuteMicrophone,
  joinListenOnly,
} = Service;

export default lockContextContainer(withModalMounter(withTracker(({ mountModal, userLocks }) => {
  const currentUser = Users.findOne({ meetingId: Auth.meetingID, userId: Auth.userID }, {
    fields: {
      role: 1,
      presenter: 1,
    },
  });
  const isViewer = currentUser.role === ROLE_VIEWER;
  const isPresenter = currentUser.presenter;

  return ({
    processToggleMuteFromOutside: arg => processToggleMuteFromOutside(arg),
    showMute: isConnected() && !isListenOnly() && !isEchoTest() && !userLocks.userMic,
    muted: isConnected() && !isListenOnly() && isMuted(),
    inAudio: isConnected() && !isEchoTest(),
    listenOnly: isConnected() && isListenOnly(),
    disable: isConnecting() || isHangingUp() || !Meteor.status().connected,
    talking: isTalking() && !isMuted(),
    isVoiceUser: isVoiceUser(),
    handleToggleMuteMicrophone: () => toggleMuteMicrophone(),
    handleJoinAudio: () => (isConnected() ? joinListenOnly() : mountModal(<AudioModalContainer />)),
    handleLeaveAudio,
    inputStream: AudioManager.inputStream,
    isViewer,
    isPresenter,
  });
})(AudioControlsContainer)));
