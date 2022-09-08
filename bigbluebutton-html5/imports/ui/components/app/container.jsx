import React, { useEffect, useRef } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
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
  validIOSVersion,
} from './service';

import { withModalMounter, getModal } from '/imports/ui/components/common/modal/service';

import App from './component';
import { makeCall } from '../../services/api';

const CUSTOM_STYLE_URL = Meteor.settings.public.app.customStyleUrl;

const intlMessages = defineMessages({
  waitingApprovalMessage: {
    id: 'app.guest.waiting',
    description: 'Message while a guest is waiting to be approved',
  },
});

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

  const {
    actionsbar,
    meetingLayout,
    meetingLayoutUpdatedAt,
    selectedLayout,
    pushLayout,
    pushLayoutMeeting,
    currentUserId,
    shouldShowPresentation: propsShouldShowPresentation,
    presentationRestoreOnUpdate,
    isPresenter,
    randomlySelectedUser,
    isModalOpen,
    presentationIsOpen: layoutPresOpen,
    isResizing: layoutIsResizing,
    cameraPosition: layoutCamPosition,
    focusedCamera: layoutFocusedCam,
    presentationVideoRate: layoutRate,
    ...otherProps
  } = props;

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const actionsBarStyle = layoutSelectOutput((i) => i.actionBar);
  const captionsStyle = layoutSelectOutput((i) => i.captions);
  const cameraDock = layoutSelectOutput((i) => i.cameraDock);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentation = layoutSelectInput((i) => i.presentation);
  const layoutType = layoutSelect((i) => i.layoutType);
  const deviceType = layoutSelect((i) => i.deviceType);
  const layoutContextDispatch = layoutDispatch();

  const { sidebarContentPanel, isOpen: sidebarContentIsOpen } = sidebarContent;
  const { sidebarNavPanel, isOpen: sidebarNavigationIsOpen } = sidebarNavigation;
  const { isOpen: presentationIsOpen } = presentation;
  const shouldShowPresentation = propsShouldShowPresentation
    && (presentationIsOpen || presentationRestoreOnUpdate);

  const { focusedId } = cameraDock;

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
  // const currentQuestionQuiz = QuestionQuizs.findOne({})
  const currentQuestionQuiz = makeCall("getCurrentQuestionQuiz")

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
          layoutPresOpen,
          layoutIsResizing,
          layoutCamPosition,
          layoutFocusedCam,
          layoutRate,
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
          currentQuestionQuiz,
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

export default injectIntl(withModalMounter(withTracker(({ intl, baseControls }) => {
  Users.find({ userId: Auth.userID, meetingId: Auth.meetingID }).observe({
    removed(userData) {
      // wait 3secs (before endMeeting), client will try to authenticate again
      const delayForReconnection = userData.ejected ? 0 : 3000;
      setTimeout(() => {
        const queryCurrentUser = Users.find({ userId: Auth.userID, meetingId: Auth.meetingID });
        if (queryCurrentUser.count() === 0) {
          endMeeting(403, userData.ejectedReason || null);
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
  const currentMeetingQuiz = Meetings.findOne({ meetingId: Auth.meetingID },
    {
      fields: {
        publishedQuestionQuiz: 1,
        voiceProp: 1,
        randomlySelectedUser: 1,
        layout: 1,
      },
    });
  const { publishedQuestionQuiz } = currentMeetingQuiz
  const {
    randomlySelectedUser,
  } = currentMeeting;

  const meetingLayout = LayoutMeetings.findOne({ meetingId: Auth.meetingID }) || {};
  const { layout, pushLayout: pushLayoutMeeting, layoutUpdatedAt, presentationIsOpen, isResizing, cameraPosition, focusedCamera, presentationVideoRate } = meetingLayout;

  if (currentUser && !currentUser.approved) {
    baseControls.updateLoadingState(intl.formatMessage(intlMessages.waitingApprovalMessage));
  }

  const UserInfo = UserInfos.find({
    meetingId: Auth.meetingID,
    requesterUserId: Auth.userID,
  }).fetch();

  const AppSettings = Settings.application;
  const { selectedLayout, pushLayout } = AppSettings;
  const { viewScreenshare } = Settings.dataSaving;
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
    validIOSVersion,
    isPhone: deviceInfo.isPhone,
    isRTL: document.documentElement.getAttribute('dir') === 'rtl',
    currentUserEmoji: currentUserEmoji(currentUser),
    hasPublishedQuestionQuiz: publishedQuestionQuiz,
    randomlySelectedUser,
    currentUserId: currentUser?.userId,
    isPresenter,
    isModerator: currentUser?.role === ROLE_MODERATOR,
    meetingLayout: layout,
    meetingLayoutUpdatedAt: layoutUpdatedAt,
    presentationIsOpen,
    isResizing,
    cameraPosition,
    focusedCamera,
    presentationVideoRate,
    selectedLayout,
    pushLayout,
    pushLayoutMeeting,
    audioAlertEnabled: AppSettings.chatAudioAlerts,
    pushAlertEnabled: AppSettings.chatPushAlerts,
    darkTheme: AppSettings.darkTheme,
    shouldShowScreenshare,
    shouldShowPresentation: !shouldShowScreenshare && !shouldShowExternalVideo,
    shouldShowExternalVideo,
    isLargeFont: Session.get('isLargeFont'),
    presentationRestoreOnUpdate: getFromUserSettings(
      'bbb_force_restore_presentation_on_new_events',
      Meteor.settings.public.presentation.restoreOnUpdate,
    ),
    hidePresentation: getFromUserSettings('bbb_hide_presentation', LAYOUT_CONFIG.hidePresentation),
    hideActionsBar: getFromUserSettings('bbb_hide_actions_bar', false),
    isModalOpen: !!getModal(),
  };
})(AppContainer)));
