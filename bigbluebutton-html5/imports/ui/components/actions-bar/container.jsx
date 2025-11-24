import React, { useContext } from 'react';
import { useIntl } from 'react-intl';
import { useMutation, useReactiveVar } from '@apollo/client';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Auth from '/imports/ui/services/auth';
import ActionsBar from './component';
import {
  layoutSelectOutput,
  layoutSelectInput,
  layoutDispatch,
} from '../layout/context';
import {
  useIsExternalVideoEnabled,
  useIsPollingEnabled,
  useIsPresentationEnabled,
  useIsTimerFeatureEnabled,
  useIsRaiseHandEnabled,
  useIsUserReactionsEnabled,
} from '/imports/ui/services/features';

import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import MediaService from '../media/service';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import { useMeetingLayoutUpdater, usePushLayoutUpdater } from '../layout/push-layout/hooks';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import deviceInfo from '/imports/utils/deviceInfo';
import { SMALL_VIEWPORT_BREAKPOINT } from '../layout/enums';

const isLayeredView = window.matchMedia(`(max-width: ${SMALL_VIEWPORT_BREAKPOINT}px)`);

const ActionsBarContainer = (props) => {
  const LAYOUT_CONFIG = window.meetingClientSettings.public.layout;
  const { showPushLayoutButton } = LAYOUT_CONFIG;
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const layoutContextDispatch = layoutDispatch();
  const cameraDockOutput = layoutSelectOutput((i) => i.cameraDock);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentationInput = layoutSelectInput((i) => i.presentation);
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

  const allowExternalVideo = useIsExternalVideoEnabled();
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const intl = useIntl();
  const isPresentationEnabled = useIsPresentationEnabled();
  const isTimerFeatureEnabled = useIsTimerFeatureEnabled();
  const isPollingEnabled = useIsPollingEnabled() && isPresentationEnabled;
  const isRaiseHandEnabled = useIsRaiseHandEnabled();
  const isReactionsButtonEnabled = useIsUserReactionsEnabled();
  const applicationSettings = useSettings(SETTINGS.APPLICATION);
  const { pushLayout } = applicationSettings;
  const setPushLayout = usePushLayoutUpdater(pushLayout);
  const setMeetingLayout = useMeetingLayoutUpdater(
    cameraDockOutput,
    cameraDockInput,
    presentationInput,
    applicationSettings,
  );
  const { isOpen: sidebarNavigationIsOpen } = sidebarNavigation;
  const { isOpen: sidebarContentIsOpen } = sidebarContent;
  const ariaHidden = sidebarNavigationIsOpen
    && sidebarContentIsOpen
    && (deviceInfo.isPhone || isLayeredView.matches);
  if (actionsBarStyle.display === false) return null;
  if (!currentMeeting) return null;

  const isSharedNotesPinnedFromGraphql = currentMeeting?.componentsFlags?.isSharedNotesPinned;

  const isSharedNotesPinned = isSharedNotesPinnedFromGraphql;
  return (
    <ActionsBar {
      ...{
        ...props,
        enableVideo: getFromUserSettings('bbb_enable_video', window.meetingClientSettings.public.kurento.enableVideo),
        showScreenshareQuickSwapButton: window.meetingClientSettings
          .public.layout.showScreenshareQuickSwapButton,
        multiUserTools: getFromUserSettings('bbb_multi_user_tools', window.meetingClientSettings.public.whiteboard.toolbar.multiUserTools),
        isReactionsButtonEnabled,
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
        isTimerActive: currentMeeting?.componentsFlags?.hasTimer,
        isTimerEnabled: isTimerFeatureEnabled,
        hasGenericContent: isThereGenericMainContent,
        setPushLayout,
        setMeetingLayout,
        showPushLayout: showPushLayoutButton && applicationSettings.selectedLayout === 'custom',
        ariaHidden,
      }
    }
    />
  );
};

export default ActionsBarContainer;
