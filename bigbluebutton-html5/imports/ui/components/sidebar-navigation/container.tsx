import React, { useEffect, useMemo } from 'react';
import {
  layoutDispatch,
  layoutSelectInput,
  layoutSelectOutput,
} from '/imports/ui/components/layout/context';
import { useIntl } from 'react-intl';
import SidebarNavigation from './component';
import { User } from '/imports/ui/Types/user';
import { Input, Output } from '/imports/ui/components/layout/layoutTypes';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { userIsInvited } from '/imports/ui/components/breakout-room/breakout-rooms-list-item/query';
import useTimer from '/imports/ui/core/hooks/useTImer';
import { BREAKOUTS_ICON, BREAKOUTS_LABEL, BREAKOUTS_APP_KEY } from '/imports/ui/components/breakout-room/constants';
import { TIMER_ICON, TIMER_LABEL, TIMER_APP_KEY } from '/imports/ui/components/timer/constants';
import { POLLS_ICON, POLLS_LABEL, POLLS_APP_KEY } from '/imports/ui/components/poll/constants';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';

const SidebarNavigationContainer = () => {
  const { data: currentUser } = useCurrentUser((u: Partial<User>) => (
    {
      presenter: u?.presenter,
      isModerator: u?.isModerator,
    }
  ));
  const isPresenter = currentUser?.presenter || false;
  const isModerator = currentUser?.isModerator || false;

  const {
    data: userIsInvitedData,
  } = useDeduplicatedSubscription(userIsInvited);

  const {
    data: currentMeeting,
  } = useMeeting((m: Partial<Meeting>) => ({
    componentsFlags: m.componentsFlags,
  }));
  const hasBreakoutRoom = currentMeeting?.componentsFlags?.hasBreakoutRoom ?? false;
  const isUserInvited = userIsInvitedData?.breakoutRoom.length > 0;

  const {
    data: timerData,
  } = useTimer();
  const intl = useIntl();
  const sidebarNavigationInput = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const sidebarNavigation = layoutSelectOutput((i: Output) => i.sidebarNavigation);
  const layoutContextDispatch = layoutDispatch();
  const {
    top,
    left,
    right,
    zIndex,
    width,
    height,
  } = sidebarNavigation;
  const {
    registeredApps,
  } = sidebarNavigationInput;
  const breakoutsAreRegistered = useMemo(() => (
    Object.keys(registeredApps).includes(BREAKOUTS_APP_KEY)), [registeredApps]);
  const pollsAreRegistered = useMemo(() => (
    Object.keys(registeredApps).includes(POLLS_APP_KEY)), [registeredApps]);
  const timerIsRegistered = useMemo(() => (
    Object.keys(registeredApps).includes(TIMER_APP_KEY)), [registeredApps]);

  const registerApp = (panel: string, name: string, icon: string) => {
    layoutContextDispatch({
      type: ACTIONS.REGISTER_SIDEBAR_APP,
      value: {
        panel,
        name,
        icon,
      },
    });
  };

  const pinApp = (panel: string) => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_APP,
      value: {
        panel,
        pin: true,
      },
    });
  };

  const unregisterApp = (panel: string) => {
    layoutContextDispatch({
      type: ACTIONS.UNREGISTER_SIDEBAR_APP,
      value: panel,
    });
  };

  useEffect(() => {
    // TODO: remove this apps setup from here.
    // Ideally each component(i.e breakouts, polls, timer) should register/unregister itself based
    // on its specific conditions.
    if (!breakoutsAreRegistered && (
      isModerator || (!isModerator && hasBreakoutRoom && isUserInvited))) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(BREAKOUTS_LABEL), BREAKOUTS_ICON);
      pinApp(BREAKOUTS_APP_KEY);
    }
    if (breakoutsAreRegistered && !isModerator && (!hasBreakoutRoom || !isUserInvited)) {
      unregisterApp(BREAKOUTS_APP_KEY);
    }

    if (!pollsAreRegistered && isPresenter) {
      registerApp(POLLS_APP_KEY, intl.formatMessage(POLLS_LABEL), POLLS_ICON);
      pinApp(POLLS_APP_KEY);
    }
    if (pollsAreRegistered && !isPresenter) {
      unregisterApp(POLLS_APP_KEY);
    }

    if (!timerIsRegistered && isModerator && timerData) {
      registerApp(TIMER_APP_KEY, intl.formatMessage(TIMER_LABEL), TIMER_ICON);
      pinApp(TIMER_APP_KEY);
    }
    if (timerIsRegistered && (!isModerator || !timerData)) {
      unregisterApp(TIMER_APP_KEY);
    }
  }, [
    layoutContextDispatch,
    currentUser,
    registeredApps,
    hasBreakoutRoom,
    isUserInvited,
    isModerator,
    timerData,
    isPresenter,
  ]);

  useEffect(() => {
    // update apps label when intl changes
    if (breakoutsAreRegistered) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(BREAKOUTS_LABEL), BREAKOUTS_ICON);
    }
    if (pollsAreRegistered) {
      registerApp(POLLS_APP_KEY, intl.formatMessage(POLLS_LABEL), POLLS_ICON);
    }
    if (timerIsRegistered) {
      registerApp(TIMER_APP_KEY, intl.formatMessage(TIMER_LABEL), TIMER_ICON);
    }
  }, [intl]);

  if (sidebarNavigation.display === false || !width || !height) return null;

  return (
    <SidebarNavigation
      top={top}
      left={left}
      right={right}
      zIndex={zIndex}
      width={width}
      height={height}
      sidebarNavigationInput={sidebarNavigationInput}
      isModerator={isModerator}
    />
  );
};

export default SidebarNavigationContainer;
