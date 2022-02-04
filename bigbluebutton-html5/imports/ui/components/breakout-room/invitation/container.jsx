import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import BreakoutRoomInvitation from './component';
import BreakoutService from '../service';
import Auth from '/imports/ui/services/auth';
import AppService from '/imports/ui/components/app/service';

const BreakoutRoomInvitationContainer = ({ isMeetingBreakout, ...props }) => {
  if (isMeetingBreakout) return null;
  return (
    <BreakoutRoomInvitation {...props} />
  );
};

export default withTracker(() => ({
  isMeetingBreakout: AppService.meetingIsBreakout(),
  breakouts: BreakoutService.getBreakoutsNoTime(),
  getBreakoutByUrlData: BreakoutService.getBreakoutByUrlData,
  currentBreakoutUrlData: BreakoutService.getBreakoutUrlByUserId(Auth.userID),
  breakoutUserIsIn: BreakoutService.getBreakoutUserIsIn(Auth.userID),
}))(BreakoutRoomInvitationContainer);
