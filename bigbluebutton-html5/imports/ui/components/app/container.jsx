import React from 'react';
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
import { startBandwidthMonitoring, updateNavigatorConnection } from '/imports/ui/services/network-information/index';

import {
  getFontSize,
  getBreakoutRooms,
  validIOSVersion,
} from './service';

import { withModalMounter } from '../modal/service';

import App from './component';
import NavBarContainer from '../nav-bar/container';
import ActionsBarContainer from '../actions-bar/container';
import MediaContainer from '../media/container';

const CUSTOM_STYLE_URL = Meteor.settings.public.app.customStyleUrl;

const propTypes = {
  navbar: PropTypes.node,
  actionsbar: PropTypes.node,
  media: PropTypes.node,
};

const defaultProps = {
  navbar: <NavBarContainer />,
  actionsbar: <ActionsBarContainer />,
  media: <MediaContainer />,
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
  const {
    navbar,
    actionsbar,
    media,
    currentUserId,
    ...otherProps
  } = props;

  return currentUserId
    ? (
      <App
        navbar={navbar}
        actionsbar={actionsbar}
        media={media}
        currentUserId={currentUserId}
        {...otherProps}
      />
    )
    : null;
};

const currentUserEmoji = (currentUser) => (currentUser ? {
  status: currentUser.emoji,
  changedAt: currentUser.emojiTime,
} : {
  status: 'none',
  changedAt: null,
});

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

  const currentUser = Users.findOne({ userId: Auth.userID }, {
    fields: {
      approved: 1, emoji: 1, userId: 1, presenter: 1,
    },
  });
  const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { publishedPoll: 1, voiceProp: 1, randomlySelectedUser: 1 } });
  const { publishedPoll, voiceProp, randomlySelectedUser } = currentMeeting;

  if (currentUser && !currentUser.approved) {
    baseControls.updateLoadingState(intl.formatMessage(intlMessages.waitingApprovalMessage));
  }

  const UserInfo = UserInfos.find({
    meetingId: Auth.meetingID,
    requesterUserId: Auth.userID,
  }).fetch();

  let customStyleUrl = getFromUserSettings('bbb_custom_style_url', false);

  if (!customStyleUrl && CUSTOM_STYLE_URL) {
    customStyleUrl = CUSTOM_STYLE_URL;
  }

  return {
    captions: CaptionsService.isCaptionsActive() ? <CaptionsContainer /> : null,
    fontSize: getFontSize(),
    hasBreakoutRooms: getBreakoutRooms().length > 0,
    customStyle: getFromUserSettings('bbb_custom_style', false),
    customStyleUrl,
    openPanel: Session.get('openPanel'),
    UserInfo,
    notify,
    validIOSVersion,
    isPhone: deviceInfo.isPhone,
    isRTL: document.documentElement.getAttribute('dir') === 'rtl',
    meetingMuted: voiceProp.muteOnStart,
    currentUserEmoji: currentUserEmoji(currentUser),
    hasPublishedPoll: publishedPoll,
    startBandwidthMonitoring,
    handleNetworkConnection: () => updateNavigatorConnection(navigator.connection),
    randomlySelectedUser,
    currentUserId: currentUser?.userId,
    isPresenter: currentUser?.presenter,
    isLargeFont: Session.get('isLargeFont'),
  };
})(AppContainer)));

AppContainer.defaultProps = defaultProps;
AppContainer.propTypes = propTypes;
