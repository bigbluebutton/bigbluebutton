import React, { useEffect } from 'react';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import { useIsPresentationEnabled, useIsExternalVideoEnabled } from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  layoutSelectInput,
  layoutSelectOutput,
} from '../layout/context';
import useSetSpeechOptions from '../audio/audio-graphql/hooks/useSetSpeechOptions';

import App from './component';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';

const AppContainer = (props) => {
  const {
    viewScreenshare,
  } = useSettings(SETTINGS.DATA_SAVING);

  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    away: u.away,
    raiseHand: u.raiseHand,
    userId: u.userId,
    presenter: u.presenter,
    speechLocale: u.speechLocale,
  }));

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    layout: m.layout,
    componentsFlags: m.componentsFlags,
  }));

  const presentationRestoreOnUpdate = getFromUserSettings(
    'bbb_force_restore_presentation_on_new_events',
    window.meetingClientSettings.public.presentation.restoreOnUpdate,
  );

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;

  const {
    selectedLayout,
    darkTheme,
  } = useSettings(SETTINGS.APPLICATION);

  const { partialUtterances, minUtteranceLength } = useSettings(SETTINGS.TRANSCRIPTION);

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const genericMainContent = layoutSelectInput((i) => i.genericMainContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const captionsStyle = layoutSelectOutput((i) => i.captions);
  const presentation = layoutSelectInput((i) => i.presentation);
  const sharedNotesInput = layoutSelectInput((i) => i.sharedNotes);

  const setSpeechOptions = useSetSpeechOptions();
  const { data: pinnedPadData } = useDeduplicatedSubscription(PINNED_PAD_SUBSCRIPTION);
  const isSharedNotesPinnedFromGraphql = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;
  const isSharedNotesPinned = sharedNotesInput?.isPinned && isSharedNotesPinnedFromGraphql;
  const isExternalVideoEnabled = useIsExternalVideoEnabled();
  const isPresentationEnabled = useIsPresentationEnabled();
  const isPresenter = currentUser?.presenter;

  const { isOpen: sidebarContentIsOpen } = sidebarContent;
  const { isOpen: sidebarNavigationIsOpen } = sidebarNavigation;
  const { isOpen } = presentation;
  const presentationIsOpen = isOpen;

  const isSharingVideo = currentMeeting?.componentsFlags.hasExternalVideo;

  const shouldShowExternalVideo = isExternalVideoEnabled && isSharingVideo;

  const shouldShowGenericMainContent = !!genericMainContent.genericContentId;

  const shouldShowScreenshare = (viewScreenshare || isPresenter)
    && (currentMeeting?.componentsFlags?.hasScreenshare
      || currentMeeting?.componentsFlags?.hasCameraAsContent);
  const shouldShowPresentation = (!shouldShowScreenshare && !isSharedNotesPinned
    && !shouldShowExternalVideo && !shouldShowGenericMainContent
    && (presentationIsOpen || presentationRestoreOnUpdate)) && isPresentationEnabled;

  useEffect(() => {
    setSpeechOptions(
      partialUtterances,
      minUtteranceLength,
    );
  }, [partialUtterances, minUtteranceLength]);

  // Update after editing app savings
  useEffect(() => {
    setSpeechOptions(
      partialUtterances,
      minUtteranceLength,
    );
  }, [partialUtterances, minUtteranceLength]);
  const customStyleUrl = getFromUserSettings('bbb_custom_style_url', false)
  || window.meetingClientSettings.public.app.customStyleUrl;

  if (!currentUser) return null;

  return currentUser?.userId
    ? (
      <App
        {...{
          hideActionsBar: getFromUserSettings('bbb_hide_actions_bar', false),
          customStyle: getFromUserSettings('bbb_custom_style', false),
          isPhone: deviceInfo.isPhone,
          currentUserAway: currentUser.away,
          currentUserRaiseHand: currentUser.raiseHand,
          customStyleUrl,
          actionsBarStyle,
          captionsStyle,
          selectedLayout,
          presentationIsOpen,
          sidebarNavigationIsOpen,
          sidebarContentIsOpen,
          shouldShowExternalVideo,
          isPresenter,
          speechLocale: currentUser?.speechLocale,
          shouldShowScreenshare,
          isSharedNotesPinned,
          shouldShowPresentation,
          genericMainContentId: genericMainContent.genericContentId,
          audioCaptions: <AudioCaptionsLiveContainer />,
          darkTheme,
          isPresentationEnabled,
        }}
        {...props}
      />
    )
    : null;
};

export default AppContainer;
