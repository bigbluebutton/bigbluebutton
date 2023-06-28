import React, { useEffect, useRef } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import Meetings, { LayoutMeetings } from '/imports/api/meetings';
import AudioCaptionsLiveContainer from '/imports/ui/components/audio/captions/live/container';
import AudioCaptionsService from '/imports/ui/components/audio/captions/service';
import { notify } from '/imports/ui/services/notification';
import CaptionsContainer from '/imports/ui/components/captions/live/container';
import CaptionsService from '/imports/ui/components/captions/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import UserInfos from '/imports/api/users-infos';
import Settings from '/imports/ui/services/settings';
import MediaService from '/imports/ui/components/media/service';
import LayoutService from '/imports/ui/components/layout/service';
import { isPresentationEnabled } from '/imports/ui/services/features';
import _ from 'lodash';
import {
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
  layoutDispatch,
} from '../layout/context';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

import {
  getFontSize,
  getBreakoutRooms,
} from './service';

import { withModalMounter, getModal } from '/imports/ui/components/common/modal/service';

import App from './component';

const CUSTOM_STYLE_URL = Meteor.settings.public.app.customStyleUrl;

const endMeeting = (code, ejectedReason) => {
  Session.set('codeError', code);
  Session.set('errorMessageDescription', ejectedReason);
  Session.set('isMeetingEnded', true);
};

const AppContainer = (props) => {
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const layoutType = useRef(null);

  const {
    actionsbar,
    selectedLayout,
    pushLayout,
    pushLayoutMeeting,
    currentUserId,
    shouldShowPresentation: propsShouldShowPresentation,
    presentationRestoreOnUpdate,
    isPresenter,
    randomlySelectedUser,
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

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const captionsStyle = layoutSelectOutput((i) => i.captions);
  const cameraDock = layoutSelectOutput((i) => i.cameraDock);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentation = layoutSelectInput((i) => i.presentation);
  const deviceType = layoutSelect((i) => i.deviceType);
  const layoutContextDispatch = layoutDispatch();

  const { sidebarContentPanel, isOpen: sidebarContentIsOpen } = sidebarContent;
  const { sidebarNavPanel, isOpen: sidebarNavigationIsOpen } = sidebarNavigation;
  const { isOpen } = presentation;
  const presentationIsOpen = isOpen;

  const shouldShowPresentation = (propsShouldShowPresentation
    && (presentationIsOpen || presentationRestoreOnUpdate)) && isPresentationEnabled();

  const { focusedId } = cameraDock;

  if(
    layoutContextDispatch
    &&  (typeof meetingLayout != "undefined")
    && (layoutType.current != meetingLayout)
    ) {
      layoutType.current = meetingLayout;
      MediaService.setPresentationIsOpen(layoutContextDispatch, true);
  }

  const horizontalPosition = cameraDock.position === 'contentLeft' || cameraDock.position === 'contentRight';
  // this is not exactly right yet
  let presentationVideoRate;
  if (horizontalPosition) {
    presentationVideoRate = cameraDock.width / window.innerWidth;
  } else {
    presentationVideoRate = cameraDock.height / window.innerHeight;
  }
  presentationVideoRate = parseFloat(presentationVideoRate.toFixed(2));

  const prevRandomUser = usePrevious(randomlySelectedUser);

  const mountRandomUserModal = !isPresenter
  && !_.isEqual(prevRandomUser, randomlySelectedUser)
  && randomlySelectedUser.length > 0
  && !isModalOpen;

  const setPushLayout = () => {
    LayoutService.setPushLayout(pushLayout);
  }

  const setMeetingLayout = () => {
    const { isResizing } = cameraDockInput;
    LayoutService.setMeetingLayout({
      layout: selectedLayout,
      presentationIsOpen,
      isResizing,
      cameraPosition: cameraDock.position,
      focusedCamera: focusedId,
      presentationVideoRate,
      pushLayout,
    });
  };

  useEffect(() => {
    MediaService.buildLayoutWhenPresentationAreaIsDisabled(layoutContextDispatch)});

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
          shouldShowPresentation,
          mountRandomUserModal,
          isPresenter,
          numCameras: cameraDockInput.numCameras,
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

export default withModalMounter(withTracker(() => {
  Users.find({ userId: Auth.userID, meetingId: Auth.meetingID }).observe({
    removed(userData) {
      // wait 3secs (before endMeeting), client will try to authenticate again
      const delayForReconnection = userData.ejected ? 0 : 3000;
      setTimeout(() => {
        const queryCurrentUser = Users.find({ userId: Auth.userID, meetingId: Auth.meetingID });
        if (queryCurrentUser.count() === 0) {
          if (userData.ejected) {
            endMeeting('403', userData.ejectedReason);
          } else {
            // Either authentication process hasn't finished yet or user did authenticate but Users
            // collection is unsynchronized. In both cases user may be able to rejoin.
            const description = Auth.isAuthenticating || Auth.loggedIn
              ? 'able_to_rejoin_user_disconnected_reason'
              : null;
            endMeeting('503', description);
          }
        }
      }, delayForReconnection);
    },
  });

  const currentUser = Users.findOne(
    { userId: Auth.userID },
    {
      fields:
      {
        approved: 1, emoji: 1, userId: 1, presenter: 1, role: 1,
      },
    },
  );

  const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
    {
      fields: {
        randomlySelectedUser: 1,
        layout: 1,
      },
    });
  const {
    randomlySelectedUser,
  } = currentMeeting;

  const meetingLayoutObj = LayoutMeetings.findOne({ meetingId: Auth.meetingID }) || {};
  const {
    layout: meetingLayout,
    pushLayout: pushLayoutMeeting,
    layoutUpdatedAt: meetingLayoutUpdatedAt,
    presentationIsOpen: meetingPresentationIsOpen,
    isResizing: isMeetingLayoutResizing,
    cameraPosition: meetingLayoutCameraPosition,
    focusedCamera: meetingLayoutFocusedCamera,
    presentationVideoRate: meetingLayoutVideoRate,
  } = meetingLayoutObj;

  const UserInfo = UserInfos.find({
    meetingId: Auth.meetingID,
    requesterUserId: Auth.userID,
  }).fetch();

  const AppSettings = Settings.application;
  const { selectedLayout, pushLayout } = AppSettings;
  const { viewScreenshare } = Settings.dataSaving;
  const shouldShowSharedNotes = MediaService.shouldShowSharedNotes();
  const shouldShowExternalVideo = MediaService.shouldShowExternalVideo();
  const shouldShowScreenshare = MediaService.shouldShowScreenshare()
    && (viewScreenshare || currentUser?.presenter);
  let customStyleUrl = getFromUserSettings('bbb_custom_style_url', false);

  if (!customStyleUrl && CUSTOM_STYLE_URL) {
    customStyleUrl = CUSTOM_STYLE_URL;
  }

  const LAYOUT_CONFIG = Meteor.settings.public.layout;

  const isPresenter = currentUser?.presenter;

  return {
    captions: CaptionsService.isCaptionsActive() ? <CaptionsContainer /> : null,
    audioCaptions: AudioCaptionsService.getAudioCaptions() ? <AudioCaptionsLiveContainer /> : null,
    fontSize: getFontSize(),
    hasBreakoutRooms: getBreakoutRooms().length > 0,
    customStyle: getFromUserSettings('bbb_custom_style', false),
    customStyleUrl,
    UserInfo,
    notify,
    isPhone: deviceInfo.isPhone,
    isRTL: document.documentElement.getAttribute('dir') === 'rtl',
    currentUserEmoji: currentUserEmoji(currentUser),
    randomlySelectedUser,
    currentUserId: currentUser?.userId,
    isPresenter,
    isModerator: currentUser?.role === ROLE_MODERATOR,
    meetingLayout,
    meetingLayoutUpdatedAt,
    meetingPresentationIsOpen,
    isMeetingLayoutResizing,
    meetingLayoutCameraPosition,
    meetingLayoutFocusedCamera,
    meetingLayoutVideoRate,
    selectedLayout,
    pushLayout,
    pushLayoutMeeting,
    audioAlertEnabled: AppSettings.chatAudioAlerts,
    pushAlertEnabled: AppSettings.chatPushAlerts,
    darkTheme: AppSettings.darkTheme,
    shouldShowScreenshare,
    shouldShowPresentation: !shouldShowScreenshare && !shouldShowExternalVideo && !shouldShowSharedNotes,
    shouldShowExternalVideo,
    shouldShowSharedNotes,
    isLargeFont: Session.get('isLargeFont'),
    presentationRestoreOnUpdate: getFromUserSettings(
      'bbb_force_restore_presentation_on_new_events',
      Meteor.settings.public.presentation.restoreOnUpdate,
    ),
    hidePresentationOnJoin: getFromUserSettings('bbb_hide_presentation_on_join', LAYOUT_CONFIG.hidePresentationOnJoin),
    hideActionsBar: getFromUserSettings('bbb_hide_actions_bar', false),
    isModalOpen: !!getModal(),
    ignorePollNotifications: Session.get('ignorePollNotifications'),
  };
})(AppContainer));
