import React from 'react';
import BreakoutRoomItem from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { ACTIONS, PANELS } from '../../../layout/enums';

const BreakoutRoomContainer = ({ breakoutRoom }) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    userId: u?.userId,
    isModerator: u?.isModerator,
    breakoutRoomsSummary: u?.breakoutRoomsSummary,
  }));

  const hasBreakoutRoom = currentMeeting?.componentsFlags?.hasBreakoutRoom ?? false;
  const hasInvitation = (currentUser?.breakoutRoomsSummary?.totalOfJoinURL > 0) ?? false;

  if (!hasBreakoutRoom && sidebarContentPanel === PANELS.BREAKOUT) {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  }

  return (
    <BreakoutRoomItem {...{
      layoutContextDispatch,
      sidebarContentPanel,
      hasBreakoutRoom: hasBreakoutRoom
      && (hasInvitation || currentUser?.isModerator),
      breakoutRoom,
    }}
    />
  );
};

export default BreakoutRoomContainer;
