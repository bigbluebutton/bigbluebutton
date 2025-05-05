import React from 'react';
import BreakoutRoomItem from './component';
import { layoutSelectInput, layoutDispatch } from '../../../layout/context';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { isBreakoutFreeJoin, userIsInvited } from './queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { ACTIONS, PANELS } from '../../../layout/enums';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const BreakoutRoomContainer = ({ breakoutRoom }) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const layoutContextDispatch = layoutDispatch();

  const {
    data: userIsInvitedData,
    error: userIsInvitedError,
    loading: userIsInvitedLoading,
  } = useDeduplicatedSubscription(userIsInvited);

  const {
    data: isBreakoutFreeJoinData,
    error: isBreakoutFreeJoinError,
    loading: isBreakoutFreeJoinLoading,
  } = useDeduplicatedSubscription(isBreakoutFreeJoin);

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

  if (userIsInvitedError || isBreakoutFreeJoinError) {
    connectionStatus.setSubscriptionFailed(true);
    logger.error(
      {
        logCode: 'subscription_Failed',
        extraInfo: {
          error: userIsInvitedError || isBreakoutFreeJoinError,
        },
      },
      'Subscription failed to load',
    );
    return null;
  }

  if (userIsInvitedLoading || isBreakoutFreeJoinLoading) return null;

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
    <BreakoutRoomItem {...{
      layoutContextDispatch,
      sidebarContentPanel,
      hasBreakoutRoom: hasBreakoutRoom
      && (
        (
          (
            userIsInvitedData.breakoutRoom.length > 0
            || isBreakoutFreeJoinData.breakoutRoom.length > 0)
          || currentMeeting?.breakoutPolicies?.freeJoin)
        || currentUser?.isModerator),
      breakoutRoom,
    }}
    />
  );
};

export default BreakoutRoomContainer;
