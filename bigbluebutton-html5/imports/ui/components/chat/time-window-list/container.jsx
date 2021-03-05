import React, { useContext } from 'react';
import TimeWindowList from '/imports/ui/components/chat/time-window-list/component';
import Auth from '/imports/ui/services/auth';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import ChatService, { UserSentMessageCollection } from '/imports/ui/components/chat/service';
import { NLayoutContext } from '../../layout/context/context';

const TimeWindowListContainer = ({ chatId, ...props }) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState } = newLayoutContext;
  const { idChatOpen } = newLayoutContextState;
  const hasUnreadMessages = ChatService.hasUnreadMessages(chatId);
  const scrollPosition = ChatService.getScrollPosition(chatId);
  const lastReadMessageTime = ChatService.lastReadMessageTime(chatId);
  const userSentMessage = UserSentMessageCollection.findOne({ userId: Auth.userID, sent: true });
  const handleScrollUpdate = position => ChatService.updateScrollPosition(position, idChatOpen);
  ChatLogger.debug('TimeWindowListContainer::render', { ...props }, new Date());

  return (
    <TimeWindowList
      {
      ...{
        ...props,
        chatId,
        hasUnreadMessages,
        scrollPosition,
        lastReadMessageTime,
        handleScrollUpdate,
        userSentMessage,
        setUserSentMessage: ChatService.setUserSentMessage,
      }
      }
    />
  );
};

export default TimeWindowListContainer;
