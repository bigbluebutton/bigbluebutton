import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import { UsersTyping } from '/imports/api/group-chat-msg';
import Users from '/imports/api/users';
import TypingIndicator from './component';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const TYPING_INDICATOR_ENABLED = CHAT_CONFIG.typingIndicator.enabled;

class TypingIndicatorContainer extends PureComponent {
  render() {
    return (
      <TypingIndicator {...this.props} />
    );
  }
}

export default withTracker(() => {
  const idChatOpen = Session.get('idChatOpen');

  let selector = {
    meetingId: Auth.meetingID,
    isTypingTo: PUBLIC_CHAT_KEY,
  };

  if (idChatOpen !== PUBLIC_CHAT_KEY) {
    selector = {
      meetingId: Auth.meetingID,
      isTypingTo: Auth.userID,
      userId: idChatOpen,
    };
  }

  const typingUsers = UsersTyping.find(selector).fetch();

  const currentUser = Users.findOne({
    meetingId: Auth.meetingID,
    userId: Auth.userID,
  }, {
    fields: {
      userId: 1,
    },
  });

  return {
    currentUserId: currentUser ? currentUser.userId : null,
    typingUsers,
    currentChatPartner: idChatOpen,
    indicatorEnabled: TYPING_INDICATOR_ENABLED,
  };
})(TypingIndicatorContainer);
