import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import { UsersTyping } from '/imports/api/group-chat-msg';
import Users from '/imports/api/users';
import TypingIndicator from './component';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

class TypingIndicatorContainer extends PureComponent {
  render() {
    return (
      <TypingIndicator {...this.props} />
    );
  }
}

export default withTracker(() => {
  const idChatOpen = Session.get('idChatOpen');

  let typingUsers = null;
  if (idChatOpen === 'public') {
    typingUsers = UsersTyping.find({
      meetingId: Auth.meetingID,
      isTypingTo: PUBLIC_CHAT_KEY,
    }).fetch();
  } else {
    typingUsers = UsersTyping.find({
      meetingId: Auth.meetingID,
      isTypingTo: Auth.userID,
      userId: idChatOpen,
    }).fetch();
  }

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
  };
})(TypingIndicatorContainer);
