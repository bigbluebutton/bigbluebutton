import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ActionsBarService from '/imports/ui/components/actions-bar/service';
import BreakoutRoomService from '/imports/ui/components/breakout-room/service';

import CreateBreakoutRoomModal from './component';

const CreateBreakoutRoomContainer = (props) => {
  const { amIModerator } = props;
  return (
    amIModerator
    && (
      <CreateBreakoutRoomModal {...props} />
    )
  );
};

export default withTracker(() => ({
  createBreakoutRoom: ActionsBarService.createBreakoutRoom,
  getBreakouts: ActionsBarService.getBreakouts,
  getLastBreakouts: ActionsBarService.getLastBreakouts,
  getBreakoutUserWasIn: BreakoutRoomService.getBreakoutUserWasIn,
  getUsersNotAssigned: ActionsBarService.getUsersNotAssigned,
  sendInvitation: ActionsBarService.sendInvitation,
  breakoutJoinedUsers: ActionsBarService.breakoutJoinedUsers(),
  users: ActionsBarService.users(),
  groups: ActionsBarService.groups(),
  isMe: ActionsBarService.isMe,
  meetingName: ActionsBarService.meetingName(),
  amIModerator: ActionsBarService.amIModerator(),
}))(CreateBreakoutRoomContainer);
