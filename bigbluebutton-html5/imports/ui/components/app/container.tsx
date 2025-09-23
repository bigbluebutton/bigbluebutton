import React, { useEffect } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import {
  useIsPresentationEnabled,
  useIsExternalVideoEnabled,
  useIsRaiseHandEnabled,
  useIsPollingEnabled,
} from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import usePresentationSwap from '/imports/ui/core/hooks/usePresentationSwap';
import useSetSpeechOptions from '/imports/ui/components/audio/audio-graphql/hooks/useSetSpeechOptions';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import {
  DispatcherFunction, Input, Layout, Output,
} from '/imports/ui/components/layout/layoutTypes';
import { handleIsNotificationEnabled } from '/imports/ui/components/plugins-engine/ui-commands/notification/handler';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
import {
  CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
  CurrentPresentationPageSubscriptionResponse,
} from '/imports/ui/components/whiteboard/queries';
import { SET_PRESENTATION_FIT_TO_WIDTH } from '/imports/ui/components/app/app-graphql/mutations';
import App from '/imports/ui/components/app/component';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import { PluginConfigFromGraphql } from '/imports/ui/components/plugins-engine/types';
import getFromUserSettings from '/imports/ui/services/users-settings';

interface AppContainerProps {
  pluginConfig: PluginConfigFromGraphql[] | undefined;
}

const AppContainer: React.FC<AppContainerProps> = ({ pluginConfig }) => {
  const { data: currentUser } = useCurrentUser((u) => ({
    away: u.away,
    raiseHand: u.raiseHand,
    userId: u.userId,
    presenter: u.presenter,
  }));

  const { data: currentMeeting } = useMeeting((m) => ({
    layout: m.layout,
    componentsFlags: m.componentsFlags,
    isBreakout: m.isBreakout,
    name: m.name,
    meetingId: m.meetingId,
  }));

  const { data: currentPageInfo } = useDeduplicatedSubscription<CurrentPresentationPageSubscriptionResponse>(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
    { skip: !currentUser?.presenter },
  );

  const { viewScreenshare } = useSettings(SETTINGS.DATA_SAVING) as { viewScreenshare: boolean };
  const { partialUtterances, minUtteranceLength } = useSettings(SETTINGS.TRANSCRIPTION) as {
    partialUtterances: boolean; minUtteranceLength: number };
  const {
    darkTheme,
    hideActionsBar: settingsHideActionsBar,
    hideControls,
    hideNotifications,
  } = useSettings(SETTINGS.APPLICATION) as {
    darkTheme: boolean;
    hideActionsBar: boolean;
    hideControls: boolean;
    hideNotifications: boolean;
  };

  const layoutContextDispatch: DispatcherFunction = layoutDispatch();
  const genericMainContent = layoutSelectInput((i: Input) => i.genericMainContent);
  const { hideNotificationToasts: layoutHideNotificationToasts } = layoutSelectInput((i: Input) => i.notificationsBar);
  const presentation = layoutSelectInput((i: Input) => i.presentation);
  const captionsStyle = layoutSelectOutput((i: Output) => i.captions);
  const selectedLayout = layoutSelect((i: Layout) => i.layoutType);
  const { isNotificationEnabled } = useReactiveVar(handleIsNotificationEnabled);

  const isPollingEnabled: boolean = useIsPollingEnabled();
  const isExternalVideoEnabled: boolean = useIsExternalVideoEnabled();
  const isPresentationEnabled: boolean = useIsPresentationEnabled();
  const isRaiseHandEnabled: boolean = useIsRaiseHandEnabled();

  const [showScreenshare] = usePresentationSwap();
  const [setPresentationFitToWidth] = useMutation(SET_PRESENTATION_FIT_TO_WIDTH);
  const setSpeechOptions = useSetSpeechOptions();

  const presentationRestoreOnUpdate = getFromUserSettings(
    'bbb_force_restore_presentation_on_new_events',
    window.meetingClientSettings.public.presentation.restoreOnUpdate,
  );

  const {
    presenter = false,
    raiseHand = false,
    away = false,
  } = currentUser || {};
  const hideActionsBar = settingsHideActionsBar || hideControls;
  const hideNotificationToasts = layoutHideNotificationToasts || hideNotifications;

  const isNonMediaLayout: boolean = [
    LAYOUT_TYPE.CAMERAS_ONLY,
    LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
  ].includes(selectedLayout);

  const presentationIsOpen: boolean = presentation.isOpen;
  const isSharedNotesPinnedFromGraphql: boolean = currentMeeting
    ?.componentsFlags?.isSharedNotesPinned || false;
  const isSharedNotesPinned: boolean = isSharedNotesPinnedFromGraphql && presentationIsOpen;

  const {
    hasExternalVideo = false,
    hasCameraAsContent = false,
    hasScreenshare = false,
  } = currentMeeting?.componentsFlags || {};
  const shouldShowExternalVideo = isExternalVideoEnabled && hasExternalVideo;
  const shouldShowScreenshare = (viewScreenshare || presenter)
    && (hasScreenshare || hasCameraAsContent) && showScreenshare;
  const shouldShowPresentation = !shouldShowScreenshare && !isSharedNotesPinned
    && !shouldShowExternalVideo && (presentationIsOpen || presentationRestoreOnUpdate)
    && isPresentationEnabled;

  const {
    pres_page_curr = [],
  } = currentPageInfo || {};
  const {
    fitToWidth = false,
    pageId = '',
  } = pres_page_curr[0] || {};

  const {
    isBreakout = false,
    name = '',
    meetingId = '',
  } = currentMeeting || {};

  const handlePresentationFitToWidth = (ftw: boolean): void => {
    setPresentationFitToWidth({
      variables: { pageId, fitToWidth: ftw },
    });
  };

  useEffect(() => {
    setSpeechOptions(partialUtterances, minUtteranceLength);
  }, [partialUtterances, minUtteranceLength]);

  if (!currentUser?.userId) return null;

  return (
    <App
      fitToWidth={fitToWidth}
      handlePresentationFitToWidth={handlePresentationFitToWidth}
      hideActionsBar={hideActionsBar}
      isNonMediaLayout={isNonMediaLayout}
      currentUserAway={away}
      currentUserRaiseHand={raiseHand}
      captionsStyle={captionsStyle}
      presentationIsOpen={presentationIsOpen}
      shouldShowExternalVideo={shouldShowExternalVideo}
      shouldShowScreenshare={shouldShowScreenshare}
      isSharedNotesPinned={isSharedNotesPinned}
      shouldShowPresentation={shouldShowPresentation}
      isNotificationEnabled={isNotificationEnabled}
      isRaiseHandEnabled={isRaiseHandEnabled}
      layoutContextDispatch={layoutContextDispatch}
      isPollingEnabled={isPollingEnabled}
      genericMainContentId={genericMainContent.genericContentId}
      audioCaptions={<AudioCaptionsLiveContainer />}
      hideNotificationToasts={hideNotificationToasts}
      darkTheme={darkTheme}
      selectedLayout={selectedLayout}
      isBreakout={isBreakout}
      meetingName={name}
      meetingId={meetingId}
      pluginConfig={pluginConfig}
    />
  );
};

export default AppContainer;
