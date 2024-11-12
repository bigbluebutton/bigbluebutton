import React from 'react';
import BreakoutRoomsListItem from './component';
import { layoutSelectInput, layoutDispatch } from '../../layout/context';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { userIsInvited } from './query';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { ACTIONS, PANELS } from '../../layout/enums';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

const BreakoutRoomsListItemContainer = () => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const {
    data: userIsInvitedData,
    error: userIsInvitedError,
    loading: userIsInvitedLoading,
  } = useDeduplicatedSubscription(userIsInvited);

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    isModerator: u?.isModerator,
  }));

  if (userIsInvitedError) {
    logger.error('Error in userIsInvited subscription:', userIsInvitedError);
    return (
      <div>
        {JSON.stringify(userIsInvitedError)}
      </div>
    );
  }

  if (userIsInvitedLoading) return null;

  const hasBreakoutRoom = currentMeeting?.componentsFlags?.hasBreakoutRoom ?? false;

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
    <BreakoutRoomsListItem {...{
      layoutContextDispatch,
      sidebarContentPanel,
      hasBreakoutRoom: hasBreakoutRoom
      && (userIsInvitedData.breakoutRoom.length > 0 || currentUser?.isModerator),
    }}
    />
  );
};

export default BreakoutRoomsListItemContainer;
