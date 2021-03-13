import React, { PureComponent } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import TimeWindowList from './component';
import Auth from '/imports/ui/services/auth';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import ChatService, { UserSentMessageCollection } from '../service';
export default class TimeWindowListContainer extends PureComponent {
  render() {
    const { chatId } = this.props;
    const hasUnreadMessages = ChatService.hasUnreadMessages(chatId);
    const scrollPosition = ChatService.getScrollPosition(chatId);
    const lastReadMessageTime = ChatService.lastReadMessageTime(chatId);
    const userSentMessage = UserSentMessageCollection.findOne({ userId: Auth.userID, sent: true });
    ChatLogger.debug('TimeWindowListContainer::render', { ...this.props }, new Date());
    return (
      <TimeWindowList
        {
        ...{
          ...this.props,
          hasUnreadMessages,
          scrollPosition,
          lastReadMessageTime,
          handleScrollUpdate: ChatService.updateScrollPosition,
          userSentMessage,
          setUserSentMessage: ChatService.setUserSentMessage,
        }
        }
      />
    );
  }
}
