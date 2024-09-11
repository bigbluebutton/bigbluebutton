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
} from '../layout/context';
import {
  useIsExternalVideoEnabled,
  useIsPollingEnabled,
  useIsPresentationEnabled,
  useIsTimerFeatureEnabled,
} from '/imports/ui/services/features';

import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
} from '/imports/ui/components/whiteboard/queries';
import MediaService from '../media/service';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import { useMeetingLayoutUpdater, usePushLayoutUpdater } from '../layout/push-layout/hooks';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';

const isReactionsButtonEnabled = () => {
  const USER_REACTIONS_ENABLED = window.meetingClientSettings.public.userReaction.enabled;
  const REACTIONS_BUTTON_ENABLED = window.meetingClientSettings.public.app.reactionsButton.enabled;

  return USER_REACTIONS_ENABLED && REACTIONS_BUTTON_ENABLED;
};

const ActionsBarContainer = (props) => {
  const NOTES_CONFIG = window.meetingClientSettings.public.notes;
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const layoutContextDispatch = layoutDispatch();
  const cameraDockOutput = layoutSelectOutput((i) => i.cameraDock);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentationInput = layoutSelectInput((i) => i.presentation);

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
  const [pinnedPadDataState, setPinnedPadDataState] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: pinnedPadData } = await useDeduplicatedSubscription(
        PINNED_PAD_SUBSCRIPTION,
      );
      setPinnedPadDataState(pinnedPadData || []);
    };

    fetchData();
  }, []);

  const isSharedNotesPinnedFromGraphql = !!pinnedPadDataState
    && pinnedPadDataState.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;

  const isSharedNotesPinned = isSharedNotesPinnedFromGraphql;
  const allowExternalVideo = useIsExternalVideoEnabled();
  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());
  const intl = useIntl();
  const isPresentationEnabled = useIsPresentationEnabled();
  const isTimerFeatureEnabled = useIsTimerFeatureEnabled();
  const isPollingEnabled = useIsPollingEnabled() && isPresentationEnabled;
  const applicationSettings = useSettings(SETTINGS.APPLICATION);
  const { pushLayout } = applicationSettings;
  const setPushLayout = usePushLayoutUpdater(pushLayout);
  const setMeetingLayout = useMeetingLayoutUpdater(
    cameraDockOutput,
    cameraDockInput,
    presentationInput,
    applicationSettings,
  );
  if (actionsBarStyle.display === false) return null;
  if (!currentMeeting) return null;

  return (
    <ActionsBar {
      ...{
        ...props,
        enableVideo: getFromUserSettings('bbb_enable_video', window.meetingClientSettings.public.kurento.enableVideo),
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
        setPushLayout,
        setMeetingLayout,
      }
    }
    />
  );
};

export default ActionsBarContainer;
