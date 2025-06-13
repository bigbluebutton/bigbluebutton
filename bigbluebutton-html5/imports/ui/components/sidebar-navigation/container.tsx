import React, { useEffect, useMemo } from 'react';
import {
  layoutDispatch,
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
} from '/imports/ui/components/layout/context';
import { useIntl } from 'react-intl';
import SidebarNavigation from './component';
import { User } from '/imports/ui/Types/user';
import { Input, Layout, Output } from '/imports/ui/components/layout/layoutTypes';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useTimer from '/imports/ui/core/hooks/useTImer';
import { TIMER_ICON, TIMER_LABEL, TIMER_APP_KEY } from '/imports/ui/components/timer/constants';
import { POLLS_ICON, POLLS_LABEL, POLLS_APP_KEY } from '/imports/ui/components/poll/constants';
import { ACTIONS, DEVICE_TYPE, PANELS } from '/imports/ui/components/layout/enums';
import useHasUnreadNotes from '/imports/ui/components/notes/hooks/useHasUnreadNotes';
import useChat from '/imports/ui/core/hooks/useChat';

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
    data: timerData,
  } = useTimer();
  const intl = useIntl();
  const unread = useHasUnreadNotes();
  const sidebarNavigationInput = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const sidebarNavigation = layoutSelectOutput((i: Output) => i.sidebarNavigation);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const sharedNotes = layoutSelectInput((i: Input) => i.sharedNotes);
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const isMobile = deviceType === DEVICE_TYPE.MOBILE;
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
  const pollsAreRegistered = useMemo(() => (
    Object.keys(registeredApps).includes(POLLS_APP_KEY)), [registeredApps]);
  const timerIsRegistered = useMemo(() => (
    Object.keys(registeredApps).includes(TIMER_APP_KEY)), [registeredApps]);

  const { sidebarContentPanel } = sidebarContent;
  const { isPinned: notesIsPinned } = sharedNotes;
  const hasUnreadNotes = sidebarContentPanel !== PANELS.SHARED_NOTES && unread && !notesIsPinned;
  const { data: chats } = useChat((chat) => ({
    totalUnread: chat.totalUnread,
  }));

  const hasUnreadMessages = (chats
    && (Array.isArray(chats) ? chats : [chats])
      .reduce((acc, chat) => acc + (chat?.totalUnread ?? 0), 0) > 0)
    ?? false;

  const registerApp = (id: string, name: string, icon: string) => {
    layoutContextDispatch({
      type: ACTIONS.REGISTER_SIDEBAR_APP,
      value: {
        id,
        name,
        icon,
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
    currentUser,
    registeredApps,
    isModerator,
    timerData,
    isPresenter,
  ]);

  useEffect(() => {
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
      isMobile={isMobile}
      top={top}
      left={left}
      right={right}
      zIndex={zIndex}
      width={width}
      height={height}
      sidebarNavigationInput={sidebarNavigationInput}
      isModerator={isModerator}
      hasUnreadMessages={hasUnreadMessages}
      hasUnreadNotes={hasUnreadNotes}
      sidebarContentPanel={sidebarContentPanel}
    />
  );
};

export default SidebarNavigationContainer;
