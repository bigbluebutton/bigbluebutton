import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import ChatList from './component';
import { getLoginTime } from '../chat-context/context';
import ChatService from '../service';

class ChatContainer extends PureComponent {
  render() {
    return (
      <ChatList {...this.props} />
    );
  }
}

export default withTracker(({ chatId }) => {
  const hasUnreadMessages = ChatService.hasUnreadMessages(chatId);
  const scrollPosition = ChatService.getScrollPosition(chatId);
  const lastReadMessageTime = ChatService.lastReadMessageTime(chatId);
  return {
    hasUnreadMessages,
    scrollPosition,
    lastReadMessageTime,
    handleScrollUpdate: ChatService.updateScrollPosition,
    handleReadMessage: ChatService.updateUnreadMessage,
    loginTime: getLoginTime(),
  };
})(ChatContainer);
