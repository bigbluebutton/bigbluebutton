import React, { useEffect, useMemo, useState } from 'react';
import {
  layoutDispatch,
  layoutSelectInput,
} from '/imports/ui/components/layout/context';
import { useIntl } from 'react-intl';
import { User } from '/imports/ui/Types/user';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { userIsInvited } from '/imports/ui/components/breakout-room/breakout-rooms-list-item/query';
import { BREAKOUTS_ICON, BREAKOUTS_LABEL, BREAKOUTS_APP_KEY } from '/imports/ui/components/breakout-room/constants';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';
import CreateBreakoutRoomContainer from '../create-breakout-room/component';

const BreakoutRoomsAppObserver = () => {
  const [breakoutsCreationIsOpen, setBreakoutsCreationIsOpen] = useState(false);
  const { data: currentUser } = useCurrentUser((u: Partial<User>) => (
    {
      presenter: u?.presenter,
      isModerator: u?.isModerator,
    }
  ));
  const isModerator = currentUser?.isModerator || false;

  const {
    data: userIsInvitedData,
  } = useDeduplicatedSubscription(userIsInvited);

  const {
    data: currentMeeting,
  } = useMeeting((m: Partial<Meeting>) => ({
    componentsFlags: m.componentsFlags,
    isBreakout: m.isBreakout,
  }));

  const hasBreakoutRoom = currentMeeting?.componentsFlags?.hasBreakoutRoom ?? false;
  const isUserInvited = userIsInvitedData?.breakoutRoom.length > 0;
  const isBreakoutMeeting = currentMeeting?.isBreakout;

  const intl = useIntl();
  const sidebarNavigationInput = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const { sidebarContentPanel } = layoutSelectInput((o: Input) => o.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const {
    registeredApps,
  } = sidebarNavigationInput;
  const breakoutsAreRegistered = useMemo(() => (
    Object.keys(registeredApps).includes(BREAKOUTS_APP_KEY)), [registeredApps]);

  const registerApp = (id: string, name: string, icon: string) => {
    layoutContextDispatch({
      type: ACTIONS.REGISTER_SIDEBAR_APP,
      value: {
        id,
        name,
        icon,
        ...(!hasBreakoutRoom && { onClick: () => setBreakoutsCreationIsOpen((currentState) => !currentState) }),
      },
    });
  };

  const pinApp = (id: string) => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_APP,
      value: {
        id,
        pin: true,
      },
    });
  };

  const unregisterApp = (id: string) => {
    layoutContextDispatch({
      type: ACTIONS.UNREGISTER_SIDEBAR_APP,
      id,
    });
  };

  useEffect(() => {
    if (!isBreakoutMeeting && isModerator) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(BREAKOUTS_LABEL), BREAKOUTS_ICON);
      pinApp(BREAKOUTS_APP_KEY);
    }
    setBreakoutsCreationIsOpen(false);
  }, [hasBreakoutRoom]);

  useEffect(() => {
    if (!breakoutsAreRegistered
      && !isBreakoutMeeting
      && (isModerator || (!isModerator && hasBreakoutRoom && isUserInvited))) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(BREAKOUTS_LABEL), BREAKOUTS_ICON);
      pinApp(BREAKOUTS_APP_KEY);
    }

    if (breakoutsAreRegistered
      && (isBreakoutMeeting || (!isModerator
      && (!hasBreakoutRoom || !isUserInvited))
      )) {
      unregisterApp(BREAKOUTS_APP_KEY);
      if (sidebarContentPanel === BREAKOUTS_APP_KEY) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: false,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.NONE,
        });
      }
    }
  }, [
    layoutContextDispatch,
    currentUser,
    registeredApps,
    hasBreakoutRoom,
    isUserInvited,
    isModerator,
    isBreakoutMeeting,
  ]);

  useEffect(() => {
    if (breakoutsAreRegistered) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(BREAKOUTS_LABEL), BREAKOUTS_ICON);
    }
  }, [intl]);

  return (breakoutsCreationIsOpen && (
    <CreateBreakoutRoomContainer
      priority="low"
      setIsOpen={setBreakoutsCreationIsOpen}
      isOpen={breakoutsCreationIsOpen}
      setUpdateUsersWhileRunning={() => {}}
    />
  ));
};

export default BreakoutRoomsAppObserver;
