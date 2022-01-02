import React, { useContext, useEffect, useRef } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { defineMessages, injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import Auth from '/imports/ui/services/auth';
import AuthTokenValidation from '/imports/api/auth-token-validation';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import { notify } from '/imports/ui/services/notification';
import CaptionsContainer from '/imports/ui/components/captions/container';
import CaptionsService from '/imports/ui/components/captions/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import deviceInfo from '/imports/utils/deviceInfo';
import UserInfos from '/imports/api/users-infos';
import LayoutContext from '../layout/context';
import Settings from '/imports/ui/services/settings';
import MediaService from '/imports/ui/components/media/service';
import _ from 'lodash';

import {
  getFontSize,
  getBreakoutRooms,
  validIOSVersion,
} from './service';

import { withModalMounter, getModal } from '../modal/service';

import App from './component';
import ActionsBarContainer from '../actions-bar/container';

const CUSTOM_STYLE_URL = Meteor.settings.public.app.customStyleUrl;

const propTypes = {
  actionsbar: PropTypes.node,
  meetingLayout: PropTypes.string.isRequired,
};

const defaultProps = {
  actionsbar: <ActionsBarContainer />,
};

const intlMessages = defineMessages({
  waitingApprovalMessage: {
    id: 'app.guest.waiting',
    description: 'Message while a guest is waiting to be approved',
  },
});

const endMeeting = (code) => {
  Session.set('codeError', code);
  Session.set('isMeetingEnded', true);
};

const AppContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;

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
    selectedLayout,
    settingsLayout,
    pushLayoutToEveryone,
    currentUserId,
    shouldShowPresentation: propsShouldShowPresentation,
    presentationRestoreOnUpdate,
    isPresenter,
    randomlySelectedUser,
    isModalOpen,
    ...otherProps
  } = props;
  const {
    input,
    output,
    layoutType,
    deviceType,
  } = layoutContextState;
  const { sidebarContent, sidebarNavigation, presentation } = input;
  const { actionBar: actionsBarStyle, captions: captionsStyle } = output;
  const { sidebarNavPanel } = sidebarNavigation;
  const { sidebarContentPanel } = sidebarContent;
  const sidebarNavigationIsOpen = sidebarNavigation.isOpen;
  const sidebarContentIsOpen = sidebarContent.isOpen;
  const presentationIsOpen = presentation.isOpen;
  const shouldShowPresentation = propsShouldShowPresentation
    && (presentationIsOpen || presentationRestoreOnUpdate);

  const prevRandomUser = usePrevious(randomlySelectedUser);

  const mountRandomUserModal = !isPresenter
  && !_.isEqual( prevRandomUser, randomlySelectedUser)
  && randomlySelectedUser.length > 0
  && !isModalOpen;

  return currentUserId
    ? (
      <App
        {...{
          actionsbar,
          actionsBarStyle,
          captionsStyle,
          currentUserId,
          layoutType,
          meetingLayout,
          selectedLayout,
          settingsLayout,
          pushLayoutToEveryone,
          deviceType,
          layoutContextDispatch,
          sidebarNavPanel,
          sidebarNavigationIsOpen,
          sidebarContentPanel,
          sidebarContentIsOpen,
          shouldShowPresentation,
          mountRandomUserModal,
          isPresenter,
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
  const authTokenValidation = AuthTokenValidation.findOne({}, { sort: { updatedAt: -1 } });

  if (authTokenValidation.connectionId !== Meteor.connection._lastSessionId) {
    endMeeting('403');
  }

  Users.find({ userId: Auth.userID, meetingId: Auth.meetingID }).observe({
    removed() {
      endMeeting('403');
    },
  });

  const currentUser = Users.findOne(
    { userId: Auth.userID },
    {
      fields:
      {
        approved: 1, emoji: 1, userId: 1, presenter: 1,
      },
    },
  );
  const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
    {
      fields: {
        publishedPoll: 1,
        voiceProp: 1,
        randomlySelectedUser: 1,
        layout: 1,
      },
    });
  const {
    publishedPoll,
    voiceProp,
    randomlySelectedUser,
    layout,
  } = currentMeeting;

  if (currentUser && !currentUser.approved) {
    baseControls.updateLoadingState(intl.formatMessage(intlMessages.waitingApprovalMessage));
  }

  const UserInfo = UserInfos.find({
    meetingId: Auth.meetingID,
    requesterUserId: Auth.userID,
  }).fetch();

  const AppSettings = Settings.application;
  const { selectedLayout } = AppSettings;
  const { viewScreenshare } = Settings.dataSaving;
  const shouldShowExternalVideo = MediaService.shouldShowExternalVideo();
  const shouldShowScreenshare = MediaService.shouldShowScreenshare()
    && (viewScreenshare || MediaService.isUserPresenter());
  let customStyleUrl = getFromUserSettings('bbb_custom_style_url', false);

  if (!customStyleUrl && CUSTOM_STYLE_URL) {
    customStyleUrl = CUSTOM_STYLE_URL;
  }

  const LAYOUT_CONFIG = Meteor.settings.public.layout;

  return {
    captions: CaptionsService.isCaptionsActive() ? <CaptionsContainer /> : null,
    fontSize: getFontSize(),
    hasBreakoutRooms: getBreakoutRooms().length > 0,
    customStyle: getFromUserSettings('bbb_custom_style', false),
    customStyleUrl,
    UserInfo,
    notify,
    validIOSVersion,
    isPhone: deviceInfo.isPhone,
    isRTL: document.documentElement.getAttribute('dir') === 'rtl',
    meetingMuted: voiceProp.muteOnStart,
    currentUserEmoji: currentUserEmoji(currentUser),
    hasPublishedPoll: publishedPoll,
    randomlySelectedUser,
    currentUserId: currentUser?.userId,
    isPresenter: currentUser?.presenter,
    meetingLayout: layout,
    selectedLayout,
    settingsLayout: selectedLayout?.replace('Push', ''),
    pushLayoutToEveryone: selectedLayout?.includes('Push'),
    audioAlertEnabled: AppSettings.chatAudioAlerts,
    pushAlertEnabled: AppSettings.chatPushAlerts,
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

AppContainer.defaultProps = defaultProps;
AppContainer.propTypes = propTypes;
