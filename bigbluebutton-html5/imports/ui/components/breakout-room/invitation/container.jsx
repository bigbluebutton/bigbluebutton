import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import BreakoutRoomInvitation from './component';
import BreakoutService from '../service';
import Auth from '/imports/ui/services/auth';

const BreakoutRoomInvitationContainer = props => (
  <BreakoutRoomInvitation {...props} />
);

export default withTracker(() => ({
  breakouts: BreakoutService.getBreakouts(),
  getBreakoutByUser: BreakoutService.getBreakoutByUser,
  currentBreakoutUser: BreakoutService.getBreakoutUserByUserId(Auth.userID),
  getBreakoutByUserId: BreakoutService.getBreakoutByUserId,
}))(BreakoutRoomInvitationContainer);
