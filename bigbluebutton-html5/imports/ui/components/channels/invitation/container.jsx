import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import BreakoutRoomInvitation from './component';
import BreakoutService from '../service';
import Auth from '/imports/ui/services/auth';
import AppService from '/imports/ui/components/app/service';
import AudioManager from '/imports/ui/services/audio-manager';

const BreakoutRoomInvitationContainer = ({ isMeetingBreakout, ...props }) => {
  if (isMeetingBreakout) return null;
  return (
    <BreakoutRoomInvitation {...props} />
  );
};

const getBreakoutURLFromMeetingId = (breakoutId) => {
  const currentUserId = Auth.userID;
  const getBreakout = Breakouts.findOne({ breakoutId }, { fields: { users: 1 } });
  const user = getBreakout ? getBreakout.users.find(u => u.userId === currentUserId) : '';
  if (user) return user.redirectToHtml5JoinURL;
  return '';
};

const getBreakoutURLFromRoom = (breakoutRoom) => {
  const currentUserId = Auth.userID;
  const user = breakoutRoom ? breakoutRoom.users.find(u => u.userId === currentUserId) : '';
  if (user) return user.redirectToHtml5JoinURL;
  return '';
};

export default withTracker(() => ({
  isMeetingBreakout: AppService.meetingIsBreakout(),
  breakouts: BreakoutService.getBreakoutsNoTime(),
  getBreakoutByUser: BreakoutService.getBreakoutByUser,
  currentBreakoutUser: BreakoutService.getBreakoutUserByUserId(Auth.userID),
  breakoutUserIsIn: BreakoutService.getBreakoutUserIsIn(Auth.userID),
  getBreakoutURLFromRoom,
  voiceUserJoined: AudioManager.isUsingAudio()
}))(BreakoutRoomInvitationContainer);
