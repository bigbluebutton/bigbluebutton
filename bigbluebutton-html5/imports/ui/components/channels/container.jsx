import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import AudioService from '/imports/ui/components/audio/service';
import AudioManager from '/imports/ui/services/audio-manager';
import Service from './service';
import Channels from './component';
import UserListService from '/imports/ui/components/user-list/service';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';

const ChannelsContainer = props => <Channels {...props} />;


export default withTracker((...props) => {
  const {
    endAllBreakouts,
    requestJoinURL,
    findBreakouts,
    getBreakoutByCurrentMeetingId,
    breakoutRoomUser,
    transferUserToMeeting,
    transferToBreakout,
    meetingId,
    amIModerator,
    closeBreakoutPanel,
    isUserActiveInBreakoutroom,
    isUserInBreakoutRoom,
    isbreakoutRoomUser,
    getCurrentMeeting,
    getBreakoutMeetingUserId
  } = Service;

  const currentMeeting = getCurrentMeeting();
  const breakoutRooms = meetingIsBreakout() ? getBreakoutByCurrentMeetingId() : findBreakouts();

  const isMicrophoneUser = AudioService.isConnected() && !AudioService.isListenOnly();
  const isMeteorConnected = Meteor.status().connected;
  const users = UserListService.getUsers();

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
    isUserActiveInBreakoutroom,
    users,
    sendInvitation: ActionsBarService.sendInvitation,
    getUsersNotAssigned: ActionsBarService.getUsersNotAssigned,
    removeUser: UserListService.removeUser,
    getUsersByMeeting: UserListService.getUsersByMeeting,
    isbreakoutRoomUser,
    getBreakoutMeetingUserId,
    exitAudio: () => AudioManager.exitAudio(),
    currentMeeting
  };
})(ChannelsContainer);
