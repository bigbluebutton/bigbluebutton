import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import BreakoutRoomItem from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';

const BreakoutRoomContainer = ({ breakoutRoom }) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const hasBreakoutRoom = !!breakoutRoom;

  return (
    <BreakoutRoomItem {...{
      layoutContextDispatch,
      sidebarContentPanel,
      hasBreakoutRoom,
      breakoutRoom,
    }}
    />
  );
};

export default withTracker(() => {
  const breakoutRoom = Breakouts.findOne(
    { parentMeetingId: Auth.meetingID },
    { fields: { timeRemaining: 1 } },
  );

  return {
    breakoutRoom,
  };
})(BreakoutRoomContainer);
