import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import AudioService from '/imports/ui/components/audio/service';
import AudioManager from '/imports/ui/services/audio-manager';
import Service from './service';
import BreakoutChannel from './component';

const BreakoutChannelContainer = props => <BreakoutChannel {...props} />;


export default withTracker((...props) => {
  const {
    endAllBreakouts,
    requestJoinURL,
    findBreakouts,
    breakoutRoomUser,
    transferUserToMeeting,
    transferToBreakout,
    meetingId,
    amIModerator,
    closeBreakoutPanel,
    isUserInBreakoutRoom,
  } = Service;

  const breakoutRooms = findBreakouts();
  const isMicrophoneUser = AudioService.isConnected() && !AudioService.isListenOnly();
  const isMeteorConnected = Meteor.status().connected;

  return {
    ...props,
    breakoutRooms,
    endAllBreakouts,
    requestJoinURL,
    breakoutRoomUser,
    transferUserToMeeting,
    transferToBreakout,
    isMicrophoneUser,
    meetingId: meetingId(),
    amIModerator: amIModerator(),
    closeBreakoutPanel,
    isMeteorConnected,
    isUserInBreakoutRoom,
    exitAudio: () => AudioManager.exitAudio(),
  };
})(BreakoutChannelContainer);
