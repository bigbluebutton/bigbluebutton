import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import { UsersTyping } from '/imports/api/group-chat-msg';
import { makeCall } from '/imports/ui/services/api';
import Users from '/imports/api/users';
import ChatForm from './component';
import ChatService from '../service';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

class ChatContainer extends PureComponent {
  render() {
    return (
      <ChatForm {...this.props} />
    );
  }
}

export default withTracker(() => {
  const idChatOpen = Session.get('idChatOpen');

  const cleanScrollAndSendMessage = (message) => {
    ChatService.updateScrollPosition(null);
    return ChatService.sendGroupMessage(message);
  };

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

  const startUserTyping = chatId => makeCall('startUserTyping', chatId);

  const stopUserTyping = () => makeCall('stopUserTyping');

  return {
    startUserTyping,
    stopUserTyping,
    currentUserId: currentUser ? currentUser.userId : null,
    typingUsers,
    currentChatPartner: idChatOpen,
    UnsentMessagesCollection: ChatService.UnsentMessagesCollection,
    minMessageLength: CHAT_CONFIG.min_message_length,
    maxMessageLength: CHAT_CONFIG.max_message_length,
    handleSendMessage: cleanScrollAndSendMessage,
  };
})(ChatContainer);
