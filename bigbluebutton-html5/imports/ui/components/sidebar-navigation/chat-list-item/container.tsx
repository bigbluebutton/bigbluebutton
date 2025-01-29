import React from 'react';
import ChatListItem from './component';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';

const ChatListItemContainer: React.FC = () => {
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  const { data: chats } = useChat((chat) => chat) as GraphqlDataHookSubscriptionResponse<Chat[]>;

  const calculateTotalUnreadMessages = (chats: Chat[] | null | undefined): number => (
    chats?.reduce((acc, chat) => acc + chat.totalUnread, 0) || 0);

  const getActiveChat = (chats: Chat[] | null | undefined, openChatId: string | undefined): Chat | undefined => {
    const publicChat = chats?.find((chat) => chat.chatId === PUBLIC_GROUP_CHAT_ID);
    return openChatId === PUBLIC_GROUP_CHAT_ID
      ? publicChat
      : chats?.find((chat) => chat.chatId === openChatId) || publicChat;
  };

  const totalUnreadMessages = calculateTotalUnreadMessages(chats);
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const openChat = getActiveChat(chats, idChatOpen);

  if (!chats || !openChat) return <></>;
  return (
    <ChatListItem
      chat={openChat}
      chatsAggregateUnreadMessages={totalUnreadMessages}
    />
  );
};

export default ChatListItemContainer;
