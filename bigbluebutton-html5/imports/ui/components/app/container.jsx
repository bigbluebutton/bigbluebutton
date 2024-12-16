import React, { useEffect } from 'react';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
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
    darkTheme,
  } = useSettings(SETTINGS.APPLICATION);

  const { partialUtterances, minUtteranceLength } = useSettings(SETTINGS.TRANSCRIPTION);

  const genericMainContent = layoutSelectInput((i) => i.genericMainContent);
  const captionsStyle = layoutSelectOutput((i) => i.captions);
  const presentation = layoutSelectInput((i) => i.presentation);
  const sharedNotesInput = layoutSelectInput((i) => i.sharedNotes);
  const { hideNotificationToasts } = layoutSelectInput((i) => i.notificationsBar);

  const setSpeechOptions = useSetSpeechOptions();
  const { data: pinnedPadData } = useDeduplicatedSubscription(PINNED_PAD_SUBSCRIPTION);
  const isSharedNotesPinnedFromGraphql = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;
  const isSharedNotesPinned = sharedNotesInput?.isPinned && isSharedNotesPinnedFromGraphql;
  const isExternalVideoEnabled = useIsExternalVideoEnabled();
  const isPresentationEnabled = useIsPresentationEnabled();
  const isPresenter = currentUser?.presenter;

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

  // Update after editing app savings
  useEffect(() => {
    setSpeechOptions(
      partialUtterances,
      minUtteranceLength,
    );
  }, [partialUtterances, minUtteranceLength]);

  if (!currentUser) return null;

  return currentUser?.userId
    ? (
      <App
        {...{
          hideActionsBar: getFromUserSettings('bbb_hide_actions_bar', false)
            || getFromUserSettings('bbb_hide_controls', false),
          currentUserAway: currentUser.away,
          currentUserRaiseHand: currentUser.raiseHand,
          captionsStyle,
          presentationIsOpen,
          shouldShowExternalVideo,
          shouldShowScreenshare,
          isSharedNotesPinned,
          shouldShowPresentation,
          genericMainContentId: genericMainContent.genericContentId,
          audioCaptions: <AudioCaptionsLiveContainer />,
          hideNotificationToasts: hideNotificationToasts
            || getFromUserSettings('bbb_hide_notifications', false),
          darkTheme,
        }}
        {...props}
      />
    )
    : null;
};

export default AppContainer;
