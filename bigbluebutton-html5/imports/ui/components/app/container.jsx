import React, { useEffect, useRef } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/audio-graphql/audio-captions/live/component';
import { notify } from '/imports/ui/services/notification';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import MediaService from '/imports/ui/components/media/service';
import { isPresentationEnabled, isExternalVideoEnabled } from '/imports/ui/services/features';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { ACTIONS, LAYOUT_TYPE, PRESENTATION_AREA } from '/imports/ui/components/layout/enums';
import { useMutation } from '@apollo/client';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';
import { SET_SYNC_WITH_PRESENTER_LAYOUT, SET_LAYOUT_PROPS } from './mutations';

import {
  getBreakoutRooms,
} from './service';

import App from './component';
import useToggleVoice from '../audio/audio-graphql/hooks/useToggleVoice';
import useUserChangedLocalSettings from '../../services/settings/hooks/useUserChangedLocalSettings';
import { PINNED_PAD_SUBSCRIPTION } from '../notes/queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import VideoStreamsState from '../video-provider/video-provider-graphql/state';
import { useIsSharing, useSharingContentType } from '../screenshare/service';
import useSettings from '../../services/settings/hooks/useSettings';
import { SETTINGS } from '../../services/settings/enums';

const AppContainer = (props) => {
  const layoutType = useRef(null);

  const {
    actionsbar,
    pushLayoutMeeting,
    currentUserId,
    shouldShowScreenshare: propsShouldShowScreenshare,
    presentationRestoreOnUpdate,
    isModalOpen,
    meetingLayout,
    meetingLayoutUpdatedAt,
    meetingPresentationIsOpen,
    isMeetingLayoutResizing,
    meetingLayoutCameraPosition,
    meetingLayoutFocusedCamera,
    meetingLayoutVideoRate,
    ...otherProps
  } = props;

  const NOTES_CONFIG = window.meetingClientSettings.public.notes;

  const {
    selectedLayout,
    pushLayout,
    audioAlertEnabled,
    pushAlertEnabled,
    darkTheme,
    fontSize = '16px',
  } = useSettings(SETTINGS.APPLICATION);
  const {
    viewScreenshare,
  } = useSettings(SETTINGS.DATA_SAVING);

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const genericComponent = layoutSelectInput((i) => i.genericComponent);
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
  const toggleVoice = useToggleVoice();
  const setLocalSettings = useUserChangedLocalSettings();
  const { data: pinnedPadData } = useDeduplicatedSubscription(PINNED_PAD_SUBSCRIPTION);
  const isSharedNotesPinnedFromGraphql = !!pinnedPadData
    && pinnedPadData.sharedNotes[0]?.sharedNotesExtId === NOTES_CONFIG.id;
  const isSharedNotesPinned = sharedNotesInput?.isPinned && isSharedNotesPinnedFromGraphql;
  const isThereWebcam = VideoStreamsState.getStreams().length > 0;

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

  const { data: currentMeeting } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const isSharingVideo = currentMeeting?.componentsFlags.hasExternalVideo;

  useEffect(() => {
    MediaService.buildLayoutWhenPresentationAreaIsDisabled(
      layoutContextDispatch,
      isSharingVideo,
      sharedNotesInput?.isPinned,
      isThereWebcam,
    );
  });

  useEffect(() => {
    if (isSharingVideo && !hasExternalVideoOnLayout) {
      layoutContextDispatch({
        type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
        value: {
          content: PRESENTATION_AREA.EXTERNAL_VIDEO,
          open: true,
        },
      });
      layoutContextDispatch({
        type: ACTIONS.SET_HAS_EXTERNAL_VIDEO,
        value: true,
      });
    }
  }, [isSharingVideo]);

  const shouldShowExternalVideo = isExternalVideoEnabled() && isSharingVideo;

  const shouldShowGenericComponent = !!genericComponent.genericComponentId;

  const validateEnforceLayout = (currentUser) => {
    const layoutTypes = Object.keys(LAYOUT_TYPE);
    const enforceLayout = currentUser?.enforceLayout;
    return enforceLayout && layoutTypes.includes(enforceLayout) ? enforceLayout : null;
  };

  const shouldShowScreenshare = propsShouldShowScreenshare
    && (viewScreenshare || isPresenter);
  const shouldShowPresentation = (!shouldShowScreenshare && !isSharedNotesPinned
    && !shouldShowExternalVideo && !shouldShowGenericComponent
    && (presentationIsOpen || presentationRestoreOnUpdate)) && isPresentationEnabled();

  if (!currentUserData) return null;

  return currentUserId
    ? (
      <App
        {...{
          actionsBarStyle,
          captionsStyle,
          currentUserId,
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
          toggleVoice,
          setLocalSettings,
          genericComponentId: genericComponent.genericComponentId,
          audioCaptions: <AudioCaptionsLiveContainer />,
          inactivityWarningDisplay,
          inactivityWarningTimeoutSecs,
          audioAlertEnabled,
          pushAlertEnabled,
          darkTheme,
          fontSize,
        }}
        {...otherProps}
      />
    )
    : null;
};

const currentUserEmoji = (currentUser) => (currentUser
  ? {
    status: currentUser.emoji,
    changedAt: currentUser.emojiTime,
  }
  : {
    status: 'none',
    changedAt: null,
  }
);

const AppTracker = withTracker((props) => {
  const {
    viewScreenshare,
    isScreenSharing,
    screenSharingContentType,
  } = props;
  const currentUser = Users.findOne(
    { userId: Auth.userID },
    {
      fields:
      {
        approved: 1, emoji: 1, raiseHand: 1, away: 1, userId: 1, role: 1, inactivityCheck: 1,
      },
    },
  );

  const meetingLayoutObj = Meetings
    .findOne({ meetingId: Auth.meetingID }) || {};

  const { layout } = meetingLayoutObj;

  const {
    propagateLayout: pushLayoutMeeting,
    cameraDockIsResizing: isMeetingLayoutResizing,
    cameraDockPlacement: meetingLayoutCameraPosition,
    cameraDockAspectRatio: meetingLayoutVideoRate,
    cameraWithFocus: meetingLayoutFocusedCamera,
  } = layout;
  const meetingLayout = LAYOUT_TYPE[layout.currentLayoutType];
  const meetingLayoutUpdatedAt = new Date(layout.updatedAt).getTime();

  const meetingPresentationIsOpen = !layout.presentationMinimized;
  const shouldShowScreenshare = MediaService.shouldShowScreenshare(
    viewScreenshare,
    isScreenSharing,
    screenSharingContentType,
  );
  let customStyleUrl = getFromUserSettings('bbb_custom_style_url', false);

  const CUSTOM_STYLE_URL = window.meetingClientSettings.public.app.customStyleUrl;

  if (!customStyleUrl && CUSTOM_STYLE_URL) {
    customStyleUrl = CUSTOM_STYLE_URL;
  }

  const LAYOUT_CONFIG = window.meetingClientSettings.public.layout;

  return {
    audioCaptions: <AudioCaptionsLiveContainer />,
    hasBreakoutRooms: getBreakoutRooms().length > 0,
    customStyle: getFromUserSettings('bbb_custom_style', false),
    customStyleUrl,
    notify,
    isPhone: deviceInfo.isPhone,
    isRTL: document.documentElement.getAttribute('dir') === 'rtl',
    currentUserEmoji: currentUserEmoji(currentUser),
    currentUserAway: currentUser.away,
    currentUserRaiseHand: currentUser.raiseHand,
    currentUserId: currentUser?.userId,
    meetingLayout,
    meetingLayoutUpdatedAt,
    meetingPresentationIsOpen,
    isMeetingLayoutResizing,
    meetingLayoutCameraPosition,
    meetingLayoutFocusedCamera,
    meetingLayoutVideoRate,
    pushLayoutMeeting,
    shouldShowScreenshare,
    isLargeFont: Session.get('isLargeFont'),
    presentationRestoreOnUpdate: getFromUserSettings(
      'bbb_force_restore_presentation_on_new_events',
      window.meetingClientSettings.public.presentation.restoreOnUpdate,
    ),
    hidePresentationOnJoin: getFromUserSettings('bbb_hide_presentation_on_join', LAYOUT_CONFIG.hidePresentationOnJoin),
    hideActionsBar: getFromUserSettings('bbb_hide_actions_bar', false),
    hideNavBar: getFromUserSettings('bbb_hide_nav_bar', false),
    ignorePollNotifications: Session.get('ignorePollNotifications'),
    User: currentUser,
  };
})(AppContainer);

// TODO: Remove this
// Temporary component until we remove all trackers
export default (props) => {
  const isScreenSharing = useIsSharing();
  const screenSharingContentType = useSharingContentType();
  return (
    <AppTracker
      {...{
        ...props,
        isScreenSharing,
        screenSharingContentType,
      }}
    />
  );
};
