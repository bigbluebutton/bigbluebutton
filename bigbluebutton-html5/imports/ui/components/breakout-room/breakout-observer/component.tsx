import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
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
import {
  BREAKOUTS_ICON,
  BREAKOUTS_LABEL,
  BREAKOUTS_APP_KEY,
  BREAKOUTS_UNASSIGNED_LABEL,
} from '/imports/ui/components/breakout-room/constants';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { UserIsInvitedSubscriptionResponse } from '/imports/ui/components/breakout-room/breakout-rooms-list-item/types';
import { useIsBreakoutRoomsEnabled } from '/imports/ui/services/features';
import usePanelClose from '/imports/ui/components/common/panel-header/usePanelClose';

const BreakoutRoomsAppObserver = () => {
  const [hasOpenedPanel, setHasOpenedPanel] = useState(false);

  const { data: currentUser } = useCurrentUser((u: Partial<User>) => (
    {
      presenter: u?.presenter,
      isModerator: u?.isModerator,
    }
  ));
  const isModerator = currentUser?.isModerator || false;

  const {
    data: userIsInvitedData,
  } = useDeduplicatedSubscription<
  UserIsInvitedSubscriptionResponse>(userIsInvited);

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
    isBreakout: m.isBreakout,
  }));

  const hasBreakoutRoom = currentMeeting?.componentsFlags?.hasBreakoutRoom ?? false;
  const isUserInvited = userIsInvitedData?.breakoutRoom && userIsInvitedData?.breakoutRoom.length > 0;
  const isBreakoutMeeting = currentMeeting?.isBreakout;
  const isBreakoutRoomsEnabled = useIsBreakoutRoomsEnabled();

  const intl = useIntl();
  const sidebarNavigationInput = layoutSelectInput((i: Input) => i.sidebarNavigation);
  const { sidebarContentPanel } = layoutSelectInput((o: Input) => o.sidebarContent);
  const {
    sidebarContentPanel: sidebarContentAuxiliaryPanel,
  } = layoutSelectInput((o: Input) => o.sidebarContentAuxiliary);
  const layoutContextDispatch = layoutDispatch();
  const {
    registeredApps,
  } = sidebarNavigationInput;
  const breakoutsAreRegistered = useMemo(() => (
    Object.keys(registeredApps).includes(BREAKOUTS_APP_KEY)), [registeredApps]);

  const isNotAssigned = !isModerator && hasBreakoutRoom && !isUserInvited;
  const breakoutLabel = isNotAssigned ? BREAKOUTS_UNASSIGNED_LABEL : BREAKOUTS_LABEL;
  const onBeforeCloseBreakoutPanel = useCallback((isInAuxiliaryPanel: boolean) => {
    if (isInAuxiliaryPanel) {
      // Explicitly reset the auxiliary panel to none.
      // We want the auxiliary panel to forget about the breakout being in the sidebar panel.
      // Without this, non-moderators could inadvertently regain access to the breakouts panel
      // through the auxiliary panel after it should have been closed.
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_PANEL,
        value: PANELS.NONE,
      });
    }
  }, [layoutContextDispatch]);
  const { closePanel: closeBreakoutPanel } = usePanelClose(PANELS.BREAKOUT, onBeforeCloseBreakoutPanel);

  const registerApp = (id: string, name: string, icon: string) => {
    layoutContextDispatch({
      type: ACTIONS.REGISTER_SIDEBAR_APP,
      value: {
        id,
        name,
        icon,
        hasNotification: isNotAssigned && !hasOpenedPanel,
      },
    });
  };

  const pinApp = (id: string) => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_APP,
      value: {
        id,
        pin: true,
        isDefault: true,
      },
    });
  };

  const setNotificationApp = (id: string, hasNotification: boolean) => {
    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_NOTIFICATION_APP,
      value: {
        id,
        hasNotification,
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
    if (!isBreakoutMeeting && isModerator && isBreakoutRoomsEnabled) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(breakoutLabel), BREAKOUTS_ICON);
      pinApp(BREAKOUTS_APP_KEY);
    }
    if (isBreakoutMeeting && isBreakoutRoomsEnabled) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(breakoutLabel), BREAKOUTS_ICON);
      pinApp(BREAKOUTS_APP_KEY);
    }
  }, [hasBreakoutRoom, isBreakoutMeeting, isModerator, isBreakoutRoomsEnabled]);

  useEffect(() => {
    setNotificationApp(BREAKOUTS_APP_KEY, isNotAssigned && !hasOpenedPanel);
  }, [isNotAssigned, hasOpenedPanel]);

  useEffect(() => {
    if (sidebarContentPanel === BREAKOUTS_APP_KEY && isNotAssigned) {
      setHasOpenedPanel(true);
      setNotificationApp(BREAKOUTS_APP_KEY, false);
    }
  }, [sidebarContentPanel]);

  useEffect(() => {
    if (!hasBreakoutRoom) {
      setHasOpenedPanel(false);
    }
  }, [hasBreakoutRoom]);

  useEffect(() => {
    if (!breakoutsAreRegistered
      && isBreakoutRoomsEnabled
      && (isBreakoutMeeting || (!isBreakoutMeeting && (isModerator || (!isModerator && hasBreakoutRoom))))) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(breakoutLabel), BREAKOUTS_ICON);
      pinApp(BREAKOUTS_APP_KEY);
    }

    if (breakoutsAreRegistered
      && !isBreakoutMeeting
      && (!isModerator
        && !hasBreakoutRoom)
    ) {
      unregisterApp(BREAKOUTS_APP_KEY);
      if (sidebarContentPanel === BREAKOUTS_APP_KEY || sidebarContentAuxiliaryPanel === BREAKOUTS_APP_KEY) {
        closeBreakoutPanel();
      }
    }
  }, [
    currentUser,
    registeredApps,
    hasBreakoutRoom,
    isUserInvited,
    isModerator,
    isBreakoutMeeting,
    breakoutLabel,
    isBreakoutRoomsEnabled,
    sidebarContentPanel,
    sidebarContentAuxiliaryPanel,
    closeBreakoutPanel,
  ]);

  useEffect(() => {
    if (breakoutsAreRegistered) {
      registerApp(BREAKOUTS_APP_KEY, intl.formatMessage(breakoutLabel), BREAKOUTS_ICON);
    }
  }, [intl, breakoutLabel]);

  return null;
};

export default BreakoutRoomsAppObserver;
