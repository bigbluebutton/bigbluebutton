import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import AudioService from '/imports/ui/components/audio/service';
import AudioManager from '/imports/ui/services/audio-manager';
import BreakoutComponent from './component';
import Service from './service';
import { NLayoutContext } from '../layout/context/context';

const BreakoutContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextDispatch } = newLayoutContext;
  return <BreakoutComponent {...{ newLayoutContextDispatch, ...props }} />;
};


export default withTracker((props) => {
  const {
    endAllBreakouts,
    requestJoinURL,
    extendBreakoutsTime,
    isExtendTimeHigherThanMeetingRemaining,
    findBreakouts,
    breakoutRoomUser,
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

  return {
    ...props,
    breakoutRooms,
    endAllBreakouts,
    requestJoinURL,
    extendBreakoutsTime,
    isExtendTimeHigherThanMeetingRemaining,
    breakoutRoomUser,
    transferUserToMeeting,
    transferToBreakout,
    isMicrophoneUser,
    meetingId: meetingId(),
    amIModerator: amIModerator(),
    isMeteorConnected,
    isUserInBreakoutRoom,
    exitAudio: () => AudioManager.exitAudio(),
    isReconnecting,
    setBreakoutAudioTransferStatus,
    getBreakoutAudioTransferStatus,
  };
})(BreakoutContainer);
