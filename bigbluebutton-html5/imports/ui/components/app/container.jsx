import React, { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
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
  layoutDispatch,
} from '../layout/context';
import useSetSpeechOptions from '../audio/audio-graphql/hooks/useSetSpeechOptions';
import { handleIsNotificationEnabled } from '/imports/ui/components/plugins-engine/ui-commands/notification/handler';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import App from './component';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';
import usePresentationSwap from '../../core/hooks/usePresentationSwap';
import { LAYOUT_TYPE } from '../layout/enums';
import { RAISED_HAND_USERS } from '/imports/ui/core/graphql/queries/users';

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

  const { data: usersData } = useDeduplicatedSubscription(RAISED_HAND_USERS);
  const isCurrentUserNextRaisedHand = usersData?.user && currentUser?.raiseHand
    ? usersData.user[0]?.userId === currentUser?.userId
    : false;

  const presentationRestoreOnUpdate = getFromUserSettings(
    'bbb_force_restore_presentation_on_new_events',
    window.meetingClientSettings.public.presentation.restoreOnUpdate,
  );

  const {
    darkTheme,
  } = useSettings(SETTINGS.APPLICATION);

  const { partialUtterances, minUtteranceLength } = useSettings(SETTINGS.TRANSCRIPTION);

  const genericMainContent = layoutSelectInput((i) => i.genericMainContent);
  const presentation = layoutSelectInput((i) => i.presentation);
  const { hideNotificationToasts } = layoutSelectInput((i) => i.notificationsBar);
  const layoutType = layoutSelect((i) => i.layoutType);
  const isNonMediaLayout = [
    LAYOUT_TYPE.CAMERAS_ONLY,
    LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
  ].includes(layoutType);
  const setSpeechOptions = useSetSpeechOptions();
  const isSharedNotesPinnedFromGraphql = currentMeeting?.componentsFlags?.isSharedNotesPinned;
  const isSharedNotesPinned = isSharedNotesPinnedFromGraphql && presentation.isOpen;
  const isExternalVideoEnabled = useIsExternalVideoEnabled();
  const isPresentationEnabled = useIsPresentationEnabled();
  const isRaiseHandEnabled = useIsRaiseHandEnabled();
  const [showScreenshare] = usePresentationSwap();

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
          isNonMediaLayout,
          currentUserAway: currentUser.away,
          currentUserRaiseHand: currentUser?.raiseHand ?? false,
          isCurrentUserNextRaisedHand,
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
