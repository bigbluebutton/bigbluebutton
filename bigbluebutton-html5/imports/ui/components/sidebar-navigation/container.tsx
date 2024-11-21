import React, { useEffect, useMemo } from 'react';
import {
  layoutDispatch,
  layoutSelectInput,
  layoutSelectOutput,
} from '/imports/ui/components/layout/context';
import { useIntl } from 'react-intl';
import SidebarNavigation from './component';
import { User } from '/imports/ui/Types/user';
import { Meeting } from '/imports/ui/Types/meeting';
import { Input, Output } from '/imports/ui/components/layout/layoutTypes';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { userIsInvited } from '/imports/ui/components/breakout-room/breakout-rooms-list-item/query';
import useTimer from '/imports/ui/core/hooks/useTImer';
import { BREAKOUTS_ICON, BREAKOUTS_LABEL, BREAKOUTS_WIDGET_KEY } from '/imports/ui/components/breakout-room/constants';
import { TIMER_ICON, TIMER_LABEL, TIMER_WIDGET_KEY } from '/imports/ui/components/timer/constants';
import { POLLS_ICON, POLLS_LABEL, POLLS_WIDGET_KEY } from '/imports/ui/components/poll/constants';
import { ACTIONS } from '/imports/ui/components/layout/enums';

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
    registeredWidgets,
  } = sidebarNavigationInput;
  const breakoutsAreRegistered = useMemo(() => (
    Object.keys(registeredWidgets).includes(BREAKOUTS_WIDGET_KEY)), [registeredWidgets]);
  const pollsAreRegistered = useMemo(() => (
    Object.keys(registeredWidgets).includes(POLLS_WIDGET_KEY)), [registeredWidgets]);
  const timerIsRegistered = useMemo(() => (
    Object.keys(registeredWidgets).includes(TIMER_WIDGET_KEY)), [registeredWidgets]);

  const registerWidget = (panel: string, name: string, icon: string) => {
    layoutContextDispatch({
      type: ACTIONS.REGISTER_SIDEBAR_NAVIGATION_WIDGET,
      value: {
        panel,
        name,
        icon,
      },
    });
  };

  const pinWidget = (panel: string) => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_WIDGET,
      value: {
        panel,
        pin: true,
      },
    });
  };

  const unregisterWidget = (panel: string) => {
    layoutContextDispatch({
      type: ACTIONS.UNREGISTER_SIDEBAR_NAVIGATION_WIDGET,
      value: panel,
    });
  };

  useEffect(() => {
    // TODO: remove this widgets setup from here.
    // Ideally each component(i.e breakouts, polls, timer) should register/unregister itself based
    // on its specific conditions.
    if (!breakoutsAreRegistered && hasBreakoutRoom
      && (isModerator || userIsInvitedData?.breakoutRoom.length > 0)) {
      registerWidget(BREAKOUTS_WIDGET_KEY, intl.formatMessage(BREAKOUTS_LABEL), BREAKOUTS_ICON);
      pinWidget(BREAKOUTS_WIDGET_KEY);
    }
    if (breakoutsAreRegistered
      && (!hasBreakoutRoom || !isModerator || userIsInvitedData?.breakoutRoom.length === 0)) {
      unregisterWidget(BREAKOUTS_WIDGET_KEY);
    }

    if (!pollsAreRegistered && isPresenter) {
      registerWidget(POLLS_WIDGET_KEY, intl.formatMessage(POLLS_LABEL), POLLS_ICON);
      pinWidget(POLLS_WIDGET_KEY);
    }
    if (pollsAreRegistered && !isPresenter) {
      unregisterWidget(POLLS_WIDGET_KEY);
    }

    if (!timerIsRegistered && isModerator && timerData) {
      registerWidget(TIMER_WIDGET_KEY, intl.formatMessage(TIMER_LABEL), TIMER_ICON);
      pinWidget(TIMER_WIDGET_KEY);
    }
    if (timerIsRegistered && (!isModerator || !timerData)) {
      unregisterWidget(TIMER_WIDGET_KEY);
    }
  }, [
    layoutContextDispatch,
    currentUser,
    registeredWidgets,
    hasBreakoutRoom,
    isModerator,
    timerData,
    isPresenter,
  ]);

  useEffect(() => {
    // update widgets label when intl changes
    if (breakoutsAreRegistered) {
      registerWidget(BREAKOUTS_WIDGET_KEY, intl.formatMessage(BREAKOUTS_LABEL), BREAKOUTS_ICON);
    }
    if (pollsAreRegistered) {
      registerWidget(POLLS_WIDGET_KEY, intl.formatMessage(POLLS_LABEL), POLLS_ICON);
    }
    if (timerIsRegistered) {
      registerWidget(TIMER_WIDGET_KEY, intl.formatMessage(TIMER_LABEL), TIMER_ICON);
    }
  }, [intl]);

  if (sidebarNavigation.display === false) return null;

  return (
    <SidebarNavigation
      top={top}
      left={left}
      right={right}
      zIndex={zIndex}
      width={width}
      height={height}
      sidebarNavigationInput={sidebarNavigationInput}
    />
  );
};

export default SidebarNavigationContainer;
