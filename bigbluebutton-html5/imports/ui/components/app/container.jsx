import React, { useEffect } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import {
  useIsPresentationEnabled,
  useIsExternalVideoEnabled,
  useIsRaiseHandEnabled,
  useIsPollingEnabled,
} from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import useSetSpeechOptions from '../audio/audio-graphql/hooks/useSetSpeechOptions';
import { handleIsNotificationEnabled } from '/imports/ui/components/plugins-engine/ui-commands/notification/handler';
import App from './component';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';
import usePresentationSwap from '../../core/hooks/usePresentationSwap';
import { LAYOUT_TYPE } from '../layout/enums';
import { SET_PRESENTATION_FIT_TO_WIDTH } from './app-graphql/mutations';
import { CURRENT_PRESENTATION_PAGE_SUBSCRIPTION } from '../whiteboard/queries';

const AppContainer = (props) => {
  const {
    viewScreenshare,
  } = useSettings(SETTINGS.DATA_SAVING);
  const { isNotificationEnabled } = useReactiveVar(handleIsNotificationEnabled);
  const layoutContextDispatch = layoutDispatch();
  const isPollingEnabled = useIsPollingEnabled();

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
    isBreakout: m.isBreakout,
    name: m.name,
    meetingId: m.meetingId,
  }));

  const { data: currentPageInfo } = useDeduplicatedSubscription(
    CURRENT_PRESENTATION_PAGE_SUBSCRIPTION,
    {
      // presenter can be undefinend leading to a bug
      // eslint-disable-next-line no-unneeded-ternary
      skip: currentUser?.presenter ? false : true,
    },
  );

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
  const { hideNotificationToasts } = layoutSelectInput((i) => i.notificationsBar);
  const layoutType = layoutSelect((i) => i.layoutType);
  const isNonMediaLayout = [
    LAYOUT_TYPE.CAMERAS_ONLY,
    LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
  ].includes(layoutType);
  const setSpeechOptions = useSetSpeechOptions();
  const { data: pinnedPadData } = useDeduplicatedSubscription(PINNED_PAD_SUBSCRIPTION);
  const isSharedNotesPinnedFromGraphql = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;
  const isSharedNotesPinned = isSharedNotesPinnedFromGraphql && presentation.isOpen;
  const isExternalVideoEnabled = useIsExternalVideoEnabled();
  const isPresentationEnabled = useIsPresentationEnabled();
  const isRaiseHandEnabled = useIsRaiseHandEnabled();
  const [showScreenshare] = usePresentationSwap();
  const [setPresentationFitToWidth] = useMutation(SET_PRESENTATION_FIT_TO_WIDTH);

  const isPresenter = currentUser?.presenter;

  const { isOpen } = presentation;
  const presentationIsOpen = isOpen;

  const isSharingVideo = currentMeeting?.componentsFlags?.hasExternalVideo;

  const shouldShowExternalVideo = isExternalVideoEnabled && isSharingVideo;

  const shouldShowGenericMainContent = !!genericMainContent.genericContentId;

  const shouldShowScreenshare = (viewScreenshare || isPresenter)
  && (currentMeeting?.componentsFlags?.hasScreenshare
    || currentMeeting?.componentsFlags?.hasCameraAsContent) && showScreenshare;
  const shouldShowPresentation = (!shouldShowScreenshare && !isSharedNotesPinned
      && !shouldShowExternalVideo && !shouldShowGenericMainContent
      && (presentationIsOpen || presentationRestoreOnUpdate)) && isPresentationEnabled;
  const currentPageInfoData = currentPageInfo?.pres_page_curr[0] ?? {};
  const fitToWidth = currentPageInfoData?.fitToWidth ?? false;
  const pageId = currentPageInfoData?.pageId ?? '';

  const handlePresentationFitToWidth = (ftw) => {
    setPresentationFitToWidth({
      variables: {
        pageId,
        fitToWidth: ftw,
      },
    });
  };

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
          fitToWidth,
          handlePresentationFitToWidth,
          hideActionsBar: getFromUserSettings('bbb_hide_actions_bar', false)
            || getFromUserSettings('bbb_hide_controls', false),
          isNonMediaLayout,
          currentUserAway: currentUser.away,
          currentUserRaiseHand: currentUser.raiseHand,
          captionsStyle,
          presentationIsOpen,
          shouldShowExternalVideo,
          shouldShowScreenshare,
          isSharedNotesPinned,
          shouldShowPresentation,
          isNotificationEnabled,
          isRaiseHandEnabled,
          layoutContextDispatch,
          isPollingEnabled,
          genericMainContentId: genericMainContent.genericContentId,
          audioCaptions: <AudioCaptionsLiveContainer />,
          hideNotificationToasts: hideNotificationToasts
            || getFromUserSettings('bbb_hide_notifications', false),
          darkTheme,
          isBreakout: currentMeeting?.isBreakout ?? false,
          meetingName: currentMeeting?.name ?? '',
          meetingId: currentMeeting?.meetingId ?? '',
        }}
        {...props}
      />
    )
    : null;
};

export default AppContainer;
