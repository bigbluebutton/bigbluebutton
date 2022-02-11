import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import AudioService from '/imports/ui/components/audio/service';
import AudioManager from '/imports/ui/services/audio-manager';
import BreakoutComponent from './component';
import Service from './service';
import LayoutContext from '../layout/context';
import {
  didUserSelectedMicrophone,
  didUserSelectedListenOnly,
} from '/imports/ui/components/audio/audio-modal/service';

const BreakoutContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextDispatch } = layoutContext;
  return <BreakoutComponent {...{ layoutContextDispatch, ...props }} />;
};

export default withTracker((props) => {
  const {
    endAllBreakouts,
    requestJoinURL,
    extendBreakoutsTime,
    isExtendTimeHigherThanMeetingRemaining,
    findBreakouts,
    getBreakoutRoomUrl,
    transferUserToMeeting,
    transferToBreakout,
    meetingId,
    amIModerator,
    isUserInBreakoutRoom,
  } = Service;

  const breakoutRooms = findBreakouts();
  const isMicrophoneUser = AudioService.isConnected() && !AudioService.isListenOnly();
  const isMeteorConnected = Meteor.status().connected;
  const isReconnecting = AudioService.isReconnecting();
  const {
    setBreakoutAudioTransferStatus,
    getBreakoutAudioTransferStatus,
  } = AudioService;

  const logMessage = () => {
    logger.warn({
      logCode: 'mainroom_audio_rejoin',
      extraInfo: { logType: 'user_action' },
    }, 'leaving breakout room couldn\'t rejoin audio in the main room');
  };

  const rejoinAudio = () => {
    if (didUserSelectedMicrophone()) {
      AudioManager.joinMicrophone().then(() => {
        makeCall('toggleVoice', null, true).catch(() => {
          forceExitAudio();
          logMessage();
        });
      }).catch(() => {
        logMessage();
      });
    } else if (didUserSelectedListenOnly()) {
      AudioManager.joinListenOnly().catch(() => {
        logMessage();
      });
    }
  };

  return {
    ...props,
    breakoutRooms,
    endAllBreakouts,
    requestJoinURL,
    extendBreakoutsTime,
    isExtendTimeHigherThanMeetingRemaining,
    getBreakoutRoomUrl,
    transferUserToMeeting,
    transferToBreakout,
    isMicrophoneUser,
    meetingId: meetingId(),
    amIModerator: amIModerator(),
    isMeteorConnected,
    isUserInBreakoutRoom,
    forceExitAudio: () => AudioManager.forceExitAudio(),
    rejoinAudio,
    isReconnecting,
    setBreakoutAudioTransferStatus,
    getBreakoutAudioTransferStatus,
  };
})(BreakoutContainer);
