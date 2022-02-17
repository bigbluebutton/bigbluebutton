import React, { PureComponent } from 'react';
import TimeWindowList from './component';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import ChatService from '../service';

export default class TimeWindowListContainer extends PureComponent {
  render() {
    const { chatId, userSentMessage } = this.props;
    const scrollPosition = ChatService.getScrollPosition(chatId);
    const lastReadMessageTime = ChatService.lastReadMessageTime(chatId);
    ChatLogger.debug('TimeWindowListContainer::render', { ...this.props }, new Date());
    return (
      <TimeWindowList
        {
        ...{
          ...this.props,
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
