import React, { useContext, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useReactiveVar } from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import ActionsBar from './component';
import {
  layoutSelectOutput,
  layoutSelectInput,
  layoutDispatch,
  layoutSelect,
} from '/imports/ui/components/layout/context';
import { DEVICE_TYPE, SMALL_VIEWPORT_BREAKPOINT } from '/imports/ui/components/layout/enums';
import {
  useIsExternalVideoEnabled,
  useIsPollingEnabled,
  useIsPresentationEnabled,
  useIsTimerFeatureEnabled,
  useIsRaiseHandEnabled,
} from '/imports/ui/services/features';

import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import MediaService from '../media/service';
import { isDarkThemeEnabled } from '/imports/ui/components/app/service';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import deviceInfo from '/imports/utils/deviceInfo';

const isLayeredView = window.matchMedia(`(max-width: ${SMALL_VIEWPORT_BREAKPOINT}px)`);

const isReactionsButtonEnabled = () => {
  const USER_REACTIONS_ENABLED = window.meetingClientSettings.public.userReaction.enabled;
  const REACTIONS_BUTTON_ENABLED = window.meetingClientSettings.public.app.reactionsButton.enabled;

  return USER_REACTIONS_ENABLED && REACTIONS_BUTTON_ENABLED;
};

const ActionsBarContainer = (props) => {
  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const layoutContextDispatch = layoutDispatch();
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);

  const { data: presentationPageData } = useDeduplicatedSubscription(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  );
  const presentationPage = presentationPageData?.pres_page_curr[0] || {};
  const isThereCurrentPresentation = !!presentationPage?.presentationId;

  const genericMainContent = layoutSelectInput((i) => i.genericMainContent);
  const isThereGenericMainContent = !!genericMainContent.genericContentId;

  const { data: currentMeeting } = useMeeting((m) => ({
    externalVideo: m.externalVideo,
    componentsFlags: m.componentsFlags,
  }));

  const isSharingVideo = !!currentMeeting?.externalVideo?.externalVideoUrl;

  const {
    pluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);
  let actionBarItems = [];
  if (pluginsExtensibleAreasAggregatedState.actionsBarItems) {
    actionBarItems = [
      ...pluginsExtensibleAreasAggregatedState.actionsBarItems,
    ];
  }

  const { data: currentUserData } = useCurrentUser((user) => ({
    presenter: user.presenter,
    isModerator: user.isModerator,
  }));

  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);

  const currentUser = {
    userId: Auth.userID,
  };
  const amIPresenter = currentUserData?.presenter;
  const amIModerator = currentUserData?.isModerator;
  const { data: pinnedPadData } = useDeduplicatedSubscription(
    PINNED_PAD_SUBSCRIPTION,
  );
  const isMobile = layoutSelect((i) => i.deviceType) === DEVICE_TYPE.MOBILE;

  const allowExternalVideo = useIsExternalVideoEnabled();
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const intl = useIntl();
  const isPresentationEnabled = useIsPresentationEnabled();
  const isTimerFeatureEnabled = useIsTimerFeatureEnabled();
  const [darkModeIsEnabled, setDarkModeIsEnabled] = useState(isDarkThemeEnabled());
  const isPollingEnabled = useIsPollingEnabled() && isPresentationEnabled;
  const isRaiseHandEnabled = useIsRaiseHandEnabled();
  const { isOpen: sidebarNavigationIsOpen } = sidebarNavigation;
  const { isOpen: sidebarContentIsOpen } = sidebarContent;
  const ariaHidden = sidebarNavigationIsOpen
    && sidebarContentIsOpen
    && (deviceInfo.isPhone || isLayeredView.matches);

  useEffect(() => {
    const handleDarkModeChange = (event) => {
      setDarkModeIsEnabled(event.detail.enabled);
    };

    window.addEventListener('darkmodechange', handleDarkModeChange);

    return () => {
      window.removeEventListener('darkmodechange', handleDarkModeChange);
    };
  }, []);

  if (actionsBarStyle.display === false) return null;
  if (!currentMeeting) return null;
  if (!pinnedPadData) return null;

  const isSharedNotesPinnedFromGraphql = !!pinnedPadData
  && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;

  const isSharedNotesPinned = isSharedNotesPinnedFromGraphql;
  return (
    <ActionsBar {
      ...{
        ...props,
        enableVideo: getFromUserSettings('bbb_enable_video', window.meetingClientSettings.public.kurento.enableVideo),
        showScreenshareQuickSwapButton: window.meetingClientSettings
          .public.layout.showScreenshareQuickSwapButton,
        multiUserTools: getFromUserSettings('bbb_multi_user_tools', window.meetingClientSettings.public.whiteboard.toolbar.multiUserTools),
        isReactionsButtonEnabled: isReactionsButtonEnabled(),
        setPresentationIsOpen: MediaService.setPresentationIsOpen,
        hasScreenshare: currentMeeting?.componentsFlags?.hasScreenshare ?? false,
        isMeteorConnected: connected,
        hasCameraAsContent: currentMeeting?.componentsFlags?.hasCameraAsContent,
        intl,
        allowExternalVideo,
        isPollingEnabled,
        isPresentationEnabled,
        isRaiseHandEnabled,
        currentUser,
        amIModerator,
        layoutContextDispatch,
        actionsBarStyle,
        amIPresenter,
        actionBarItems,
        isThereCurrentPresentation,
        isSharingVideo,
        stopExternalVideoShare,
        isSharedNotesPinned,
        isTimerActive: currentMeeting.componentsFlags.hasTimer,
        isTimerEnabled: isTimerFeatureEnabled,
        hasGenericContent: isThereGenericMainContent,
        ariaHidden,
        isDarkThemeEnabled: darkModeIsEnabled,
        isMobile,
      }
    }
    />
  );
};

export default ActionsBarContainer;
