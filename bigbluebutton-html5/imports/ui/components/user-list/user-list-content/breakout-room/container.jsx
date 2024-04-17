import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import BreakoutRoomItem from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const BreakoutRoomContainer = ({ breakoutRoom }) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const hasBreakoutRoom = currentMeeting?.componentsFlags?.hasBreakoutRoom ?? false;

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

export default BreakoutRoomContainer;
