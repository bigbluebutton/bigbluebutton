import React, { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import {
  useIsPresentationEnabled,
  useIsExternalVideoEnabled,
  useIsRaiseHandEnabled,
  useIsPollingEnabled,
} from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import usePresentationSwap from '/imports/ui/core/hooks/usePresentationSwap';
import useSetSpeechOptions from '/imports/ui/components/audio/audio-graphql/hooks/useSetSpeechOptions';
import {
  layoutSelect,
  layoutSelectInput,
  layoutDispatch,
} from '/imports/ui/components/layout/context';
import {
  DispatcherFunction, Input, Layout,
} from '/imports/ui/components/layout/layoutTypes';
import { handleIsNotificationEnabled } from '/imports/ui/components/plugins-engine/ui-commands/notification/handler';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
import App from '/imports/ui/components/app/component';
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
    voice: u.voice,
  }));

  const { data: currentMeeting } = useMeeting((m) => ({
    layout: m.layout,
    componentsFlags: m.componentsFlags,
    isBreakout: m.isBreakout,
    name: m.name,
    meetingId: m.meetingId,
  }));

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
  const selectedLayout = layoutSelect((i: Layout) => i.layoutType);
  const { isNotificationEnabled } = useReactiveVar(handleIsNotificationEnabled);

  const isPollingEnabled: boolean = useIsPollingEnabled();
  const isExternalVideoEnabled: boolean = useIsExternalVideoEnabled();
  const isPresentationEnabled: boolean = useIsPresentationEnabled();
  const isRaiseHandEnabled: boolean = useIsRaiseHandEnabled();

  const [showScreenshare] = usePresentationSwap();
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
    hasScreenshareAsContent = false,
  } = currentMeeting?.componentsFlags || {};
  const shouldShowExternalVideo = isExternalVideoEnabled && hasExternalVideo;
  const shouldShowScreenshare = (viewScreenshare || presenter)
    && (hasScreenshareAsContent || hasCameraAsContent) && showScreenshare;
  const shouldShowPresentation = !shouldShowScreenshare && !isSharedNotesPinned
    && !shouldShowExternalVideo && (presentationIsOpen || presentationRestoreOnUpdate)
    && isPresentationEnabled;

  const {
    isBreakout = false,
    name = '',
    meetingId = '',
  } = currentMeeting || {};

  useEffect(() => {
    setSpeechOptions(partialUtterances, minUtteranceLength);
  }, [partialUtterances, minUtteranceLength]);

  if (!currentUser?.userId) return null;

  return (
    <App
      hideActionsBar={hideActionsBar}
      isNonMediaLayout={isNonMediaLayout}
      currentUserAway={away}
      currentUserRaiseHand={raiseHand}
      currentUserHasVoice={!!currentUser?.voice}
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
