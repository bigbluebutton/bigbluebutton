import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ChatForm from './component';
import ChatService from '../service';

const CHAT_CONFIG = Meteor.settings.public.chat;
class ChatContainer extends PureComponent {
  render() {
    return (
      <ChatForm {...this.props} />
    );
  }
}

export default withTracker(() => {
  const cleanScrollAndSendMessage = (message) => {
    ChatService.updateScrollPosition(null);
    return ChatService.sendGroupMessage(message);
  };
  return {
    UnsentMessagesCollection: ChatService.UnsentMessagesCollection,
    minMessageLength: CHAT_CONFIG.min_message_length,
    maxMessageLength: CHAT_CONFIG.max_message_length,
    handleSendMessage: cleanScrollAndSendMessage,
  };
})(ChatContainer);
