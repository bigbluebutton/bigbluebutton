import React, { useEffect, useRef, useState } from 'react';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import MediaService from '/imports/ui/components/media/service';
import { useIsPresentationEnabled, useIsScreenSharingEnabled, useIsExternalVideoEnabled } from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { ACTIONS, LAYOUT_TYPE, PRESENTATION_AREA } from '/imports/ui/components/layout/enums';
import { useMutation, useReactiveVar } from '@apollo/client';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import { SET_SYNC_WITH_PRESENTER_LAYOUT, SET_LAYOUT_PROPS } from './mutations';
import useSetSpeechOptions from '../audio/audio-graphql/hooks/useSetSpeechOptions';

import App from './component';
import useUserChangedLocalSettings from '../../services/settings/hooks/useUserChangedLocalSettings';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/queries';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';
import { useStorageKey } from '../../services/storage/hooks';
import { useVideoStreamsCount } from '../video-provider/hooks';

const currentUserEmoji = (currentUser) => (currentUser
  ? {
    status: currentUser.reactionEmoji,
    changedAt: currentUser.reactionEmojiTime,
  }
  : {
    status: 'none',
    changedAt: null,
  }
);

const AppContainer = (props) => {
  const LAYOUT_CONFIG = window.meetingClientSettings.public.layout;
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
  const meetingLayoutUpdatedAt = new Date(currentMeeting?.layout.updatedAt).getTime();
  const meetingPresentationIsOpen = !currentMeeting?.layout.presentationMinimized;
  const presentationRestoreOnUpdate = getFromUserSettings(
    'bbb_force_restore_presentation_on_new_events',
    window.meetingClientSettings.public.presentation.restoreOnUpdate,
  );

  const {
    propagateLayout: pushLayoutMeeting,
    cameraDockIsResizing: isMeetingLayoutResizing,
    cameraDockPlacement: meetingLayoutCameraPosition,
    cameraDockAspectRatio: meetingLayoutVideoRate,
    cameraWithFocus: meetingLayoutFocusedCamera,
  } = (currentMeeting?.layout || {});

  const isLargeFont = useStorageKey('isLargeFont');
  const ignorePollNotifications = useStorageKey('ignorePollNotifications');

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;

  const {
    selectedLayout,
    pushLayout,
    chatAudioAlerts,
    chatPushAlerts,
    darkTheme,
    fontSize = '16px',
  } = useSettings(SETTINGS.APPLICATION);

  const { partialUtterances, minUtteranceLength } = useSettings(SETTINGS.TRANSCRIPTION);

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const genericMainContent = layoutSelectInput((i) => i.genericMainContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const captionsStyle = layoutSelectOutput((i) => i.captions);
  const cameraDock = layoutSelectOutput((i) => i.cameraDock);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentation = layoutSelectInput((i) => i.presentation);
  const sharedNotesInput = layoutSelectInput((i) => i.sharedNotes);
  const deviceType = layoutSelect((i) => i.deviceType);
  const hasExternalVideoOnLayout = layoutSelectInput((i) => i.externalVideo.hasExternalVideo);
  const layoutContextDispatch = layoutDispatch();

  const [setSyncWithPresenterLayout] = useMutation(SET_SYNC_WITH_PRESENTER_LAYOUT);
  const [setMeetingLayoutProps] = useMutation(SET_LAYOUT_PROPS);
  const setLocalSettings = useUserChangedLocalSettings();
  const [pinnedPadDataState, setPinnedPadDataState] = useState(null);
  const setSpeechOptions = useSetSpeechOptions();
  const isSharedNotesPinnedFromGraphql = !!pinnedPadDataState
    && pinnedPadDataState.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;
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

  const isModerator = currentUserData?.isModerator;
  const isPresenter = currentUserData?.presenter;
  const inactivityWarningDisplay = currentUserData?.inactivityWarningDisplay;
  const inactivityWarningTimeoutSecs = currentUserData?.inactivityWarningTimeoutSecs;

  const { sidebarContentPanel, isOpen: sidebarContentIsOpen } = sidebarContent;
  const { sidebarNavPanel, isOpen: sidebarNavigationIsOpen } = sidebarNavigation;
  const { isOpen } = presentation;
  const presentationIsOpen = isOpen;

  const { focusedId } = cameraDock;

  const connected = useReactiveVar(connectionStatus.getConnectedStatusVar());

  useEffect(() => {
    const fetchData = async () => {
      const { data: pinnedPadData } = await useDeduplicatedSubscription(
        PINNED_PAD_SUBSCRIPTION,
      );
      setPinnedPadDataState(pinnedPadData || []);
    };
    fetchData();
  }, [sharedNotesInput]);

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

  const horizontalPosition = cameraDock.position === 'contentLeft' || cameraDock.position === 'contentRight';
  // this is not exactly right yet
  let presentationVideoRate;
  if (horizontalPosition) {
    presentationVideoRate = cameraDock.width / window.innerWidth;
  } else {
    presentationVideoRate = cameraDock.height / window.innerHeight;
  }
  presentationVideoRate = parseFloat(presentationVideoRate.toFixed(2));

  const setPushLayout = () => {
    setSyncWithPresenterLayout({
      variables: {
        syncWithPresenterLayout: pushLayout,
      },
    });
  };

  const setMeetingLayout = () => {
    const { isResizing } = cameraDockInput;

    setMeetingLayoutProps({
      variables: {
        layout: selectedLayout,
        syncWithPresenterLayout: pushLayout,
        presentationIsOpen,
        isResizing,
        cameraPosition: cameraDock.position || 'contentTop',
        focusedCamera: focusedId,
        presentationVideoRate,
      },
    });
  };

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

  const validateEnforceLayout = (currUser) => {
    const layoutTypes = Object.keys(LAYOUT_TYPE);
    const enforceLayout = currUser?.enforceLayout;
    return enforceLayout && layoutTypes.includes(enforceLayout) ? enforceLayout : null;
  };

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
          presentationRestoreOnUpdate,
          hidePresentationOnJoin: getFromUserSettings('bbb_hide_presentation_on_join', LAYOUT_CONFIG.hidePresentationOnJoin),
          hideActionsBar: getFromUserSettings('bbb_hide_actions_bar', false),
          hideNavBar: getFromUserSettings('bbb_hide_nav_bar', false),
          customStyle: getFromUserSettings('bbb_custom_style', false),
          isPhone: deviceInfo.isPhone,
          isRTL: document.documentElement.getAttribute('dir') === 'rtl',
          currentUserEmoji: currentUserEmoji(currentUser),
          currentUserAway: currentUser.away,
          currentUserRaiseHand: currentUser.raiseHand,
          currentUserId: currentUser.userId,
          User: currentUser,
          customStyleUrl,
          connected,
          actionsBarStyle,
          captionsStyle,
          setPushLayout,
          setMeetingLayout,
          meetingLayout,
          selectedLayout,
          pushLayout,
          pushLayoutMeeting,
          meetingLayoutUpdatedAt,
          presentationIsOpen,
          cameraPosition: cameraDock.position,
          focusedCamera: focusedId,
          presentationVideoRate,
          cameraWidth: cameraDock.width,
          cameraHeight: cameraDock.height,
          cameraIsResizing: cameraDockInput.isResizing,
          meetingPresentationIsOpen,
          isMeetingLayoutResizing,
          meetingLayoutCameraPosition,
          meetingLayoutFocusedCamera,
          meetingLayoutVideoRate,
          horizontalPosition,
          deviceType,
          layoutContextDispatch,
          sidebarNavPanel,
          sidebarNavigationIsOpen,
          sidebarContentPanel,
          sidebarContentIsOpen,
          shouldShowExternalVideo,
          isPresenter,
          numCameras: cameraDockInput.numCameras,
          enforceLayout: validateEnforceLayout(currentUserData),
          speechLocale: currentUserData?.speechLocale,
          isModerator,
          shouldShowScreenshare,
          isSharedNotesPinned,
          shouldShowPresentation,
          setLocalSettings,
          genericMainContentId: genericMainContent.genericContentId,
          audioCaptions: <AudioCaptionsLiveContainer />,
          inactivityWarningDisplay,
          inactivityWarningTimeoutSecs,
          setSpeechOptions,
          chatPushAlerts,
          chatAudioAlerts,
          darkTheme,
          fontSize,
          isLargeFont,
          ignorePollNotifications,
          isPresentationEnabled,
        }}
        {...otherProps}
      />
    )
    : null;
};

export default AppContainer;
