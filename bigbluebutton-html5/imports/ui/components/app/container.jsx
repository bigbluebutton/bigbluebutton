import React, { useEffect, useRef } from 'react';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import MediaService from '/imports/ui/components/media/service';
import { useIsPresentationEnabled, useIsScreenSharingEnabled, useIsExternalVideoEnabled } from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { ACTIONS, LAYOUT_TYPE } from '/imports/ui/components/layout/enums';
import {
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import useSetSpeechOptions from '../audio/audio-graphql/hooks/useSetSpeechOptions';

import App from './component';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';
import { useVideoStreamsCount } from '../video-provider/hooks';

const AppContainer = (props) => {
  const layoutType = useRef(null);

  const {
    actionsbar,
    currentUserId,
    shouldShowScreenshare: propsShouldShowScreenshare,
    isModalOpen,
    ...otherProps
  } = props;

  const {
    viewScreenshare,
  } = useSettings(SETTINGS.DATA_SAVING);

  const {
    data: currentUser,
  } = useCurrentUser((u) => ({
    away: u.away,
    reactionEmoji: u.reactionEmoji,
    approved: 1,
    raiseHand: u.raiseHand,
    userId: u.userId,
    role: u.role,
    inactivityWarningDisplay: u.inactivityWarningDisplay,
    presenter: u.presenter,
  }));

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    layout: m.layout,
    componentsFlags: m.componentsFlags,
  }));

  const meetingLayout = LAYOUT_TYPE[currentMeeting?.layout.currentLayoutType];
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
  const layoutContextDispatch = layoutDispatch();

  const setSpeechOptions = useSetSpeechOptions();
  const { data: pinnedPadData } = useDeduplicatedSubscription(PINNED_PAD_SUBSCRIPTION);
  const isSharedNotesPinnedFromGraphql = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;
  const isSharedNotesPinned = sharedNotesInput?.isPinned && isSharedNotesPinnedFromGraphql;
  const isThereWebcam = useVideoStreamsCount() > 0;
  const isScreenSharingEnabled = useIsScreenSharingEnabled();
  const isExternalVideoEnabled = useIsExternalVideoEnabled();
  const isPresentationEnabled = useIsPresentationEnabled();

  const { data: currentUserData } = useCurrentUser((user) => ({
    enforceLayout: user.enforceLayout,
    isModerator: user.isModerator,
    presenter: user.presenter,
    speechLocale: user.speechLocale,
    inactivityWarningDisplay: user.inactivityWarningDisplay,
    inactivityWarningTimeoutSecs: user.inactivityWarningTimeoutSecs,
  }));

  const isPresenter = currentUserData?.presenter;

  const { isOpen: sidebarContentIsOpen } = sidebarContent;
  const { isOpen: sidebarNavigationIsOpen } = sidebarNavigation;
  const { isOpen } = presentation;
  const presentationIsOpen = isOpen;

  useEffect(() => {
    if (
      layoutContextDispatch
      && (typeof meetingLayout !== 'undefined')
      && (layoutType.current !== meetingLayout)
      && sharedNotesInput?.isPinned
    ) {
      layoutType.current = meetingLayout;
      MediaService.setPresentationIsOpen(layoutContextDispatch, true);
    }
  }, [meetingLayout, layoutContextDispatch, layoutType]);

  useEffect(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_TYPE,
      value: selectedLayout,
    });
  }, [selectedLayout]);

  const isSharingVideo = currentMeeting?.componentsFlags.hasExternalVideo;

  useEffect(() => {
    MediaService.buildLayoutWhenPresentationAreaIsDisabled(
      layoutContextDispatch,
      isSharingVideo,
      sharedNotesInput?.isPinned,
      isThereWebcam,
      isScreenSharingEnabled,
      isPresentationEnabled,
    );
  });

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

  if (!currentUserData) return null;

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
          speechLocale: currentUserData?.speechLocale,
          shouldShowScreenshare,
          isSharedNotesPinned,
          shouldShowPresentation,
          genericMainContentId: genericMainContent.genericContentId,
          audioCaptions: <AudioCaptionsLiveContainer />,
          darkTheme,
          isPresentationEnabled,
        }}
        {...otherProps}
      />
    )
    : null;
};

export default AppContainer;
