import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import { UsersTyping } from '/imports/api/group-chat-msg';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';
import TypingIndicator from './component';

const CHAT_CONFIG = Meteor.settings.public.chat;
const USER_CONFIG = Meteor.settings.public.user;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;

const TypingIndicatorContainer = props => <TypingIndicator {...props} />;

export default withTracker(({ idChatOpen }) => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID }, {
    fields: {
      'lockSettingsProps.hideUserList': 1,
    },
  });

  const selector = {
    meetingId: Auth.meetingID,
    isTypingTo: PUBLIC_CHAT_KEY,
    userId: { $ne: Auth.userID },
  };

  if (idChatOpen !== PUBLIC_CHAT_KEY) {
    selector.isTypingTo = Auth.userID;
    selector.userId = idChatOpen;
  }

  const currentUser = Users.findOne({
    meetingId: Auth.meetingID,
    userId: Auth.userID,
  }, {
    fields: {
      role: 1,
    },
  });

  if (meeting.lockSettingsProps.hideUserList && currentUser?.role === USER_CONFIG.role_viewer) {
    selector.role = { $ne: USER_CONFIG.role_viewer };
  }

  const typingUsers = UsersTyping.find(selector).fetch();

  return {
    typingUsers,
    indicatorEnabled: TYPING_INDICATOR_ENABLED,
  };
})(TypingIndicatorContainer);
