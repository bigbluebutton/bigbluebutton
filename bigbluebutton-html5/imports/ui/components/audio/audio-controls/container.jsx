import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import AudioManager from '/imports/ui/services/audio-manager';
import lockContextContainer from '/imports/ui/components/lock-viewers/context/container';
import { withUsersConsumer } from '/imports/ui/components/components-data/users-context/context';
import logger from '/imports/startup/client/logger';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';
import getFromUserSettings from '/imports/ui/services/users-settings';
import AudioControls from './component';
import {
  setUserSelectedMicrophone,
  setUserSelectedListenOnly,
} from '../audio-modal/service';
import { layoutSelect } from '/imports/ui/components/layout/context';

import Service from '../service';
import AppService from '/imports/ui/components/app/service';

const ROLE_VIEWER = Meteor.settings.public.user.role_viewer;
const APP_CONFIG = Meteor.settings.public.app;

const AudioControlsContainer = (props) => {
  const {
    users, lockSettings, userLocks, children, ...newProps
  } = props;
  const isRTL = layoutSelect((i) => i.isRTL);
  return <AudioControls {...{ ...newProps, isRTL }} />;
};

const handleLeaveAudio = () => {
  const meetingIsBreakout = AppService.meetingIsBreakout();

  if (!meetingIsBreakout) {
    setUserSelectedMicrophone(false);
    setUserSelectedListenOnly(false);
  }

  const skipOnFistJoin = getFromUserSettings('bbb_skip_check_audio_on_first_join', APP_CONFIG.skipCheckOnJoin);
  if (skipOnFistJoin && !Storage.getItem('getEchoTest')) {
    Storage.setItem('getEchoTest', true);
  }

  Service.forceExitAudio();
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

export default withUsersConsumer(
  lockContextContainer(
    withTracker(({ userLocks, users }) => {
      const currentUser = users[Auth.meetingID][Auth.userID];
      const isViewer = currentUser.role === ROLE_VIEWER;
      const isPresenter = currentUser.presenter;
      const { status } = Service.getBreakoutAudioTransferStatus();

      if (status === AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.RETURNING) {
        Service.setBreakoutAudioTransferStatus({
          status: AudioManager.BREAKOUT_AUDIO_TRANSFER_STATES.DISCONNECTED,
        });
        Service.recoverMicState();
      }

      return ({
        showMute: isConnected() && !isListenOnly() && !isEchoTest() && !userLocks.userMic,
        muted: isConnected() && !isListenOnly() && isMuted(),
        inAudio: isConnected() && !isEchoTest(),
        listenOnly: isConnected() && isListenOnly(),
        disable: isConnecting() || isHangingUp() || !Meteor.status().connected,
        talking: isTalking() && !isMuted(),
        isVoiceUser: isVoiceUser(),
        handleToggleMuteMicrophone: () => toggleMuteMicrophone(),
        joinListenOnly,
        handleLeaveAudio,
        inputStream: AudioManager.inputStream,
        isViewer,
        isPresenter,
        isConnected,
      });
    })(AudioControlsContainer),
  ),
);
