import {
  useEffect, useMemo, useState, useCallback,
} from 'react';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

interface UseUnreadChatMessagesProps {
  isChatPanelOpened: boolean;
  skip?: boolean;
}

const useHasUnreadChatMessages = ({ isChatPanelOpened, skip = false }: UseUnreadChatMessagesProps) => {
  const [totalUnread, setTotalUnread] = useState(0);

  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);

  const skipSubscription = skip;

  const { data: chats } = useChat(
    (chat) => chat,
    { skip: skipSubscription },
  ) as GraphqlDataHookSubscriptionResponse<Chat[]>;

  const calculateTotalUnreadMessages = useCallback(
    (chats: Chat[] | null | undefined): number => (
      chats?.reduce((acc, chat) => acc + chat.totalUnread, 0) || 0
    ),
    [],
  );

  useEffect(() => {
    if (skipSubscription || !chats) return;

    const currentTotal = calculateTotalUnreadMessages(chats);
    setTotalUnread(currentTotal);
  }, [chats, calculateTotalUnreadMessages, skipSubscription]);

  const getActiveChat = useCallback((
    chats: Chat[] | null | undefined,
    openChatId: string | undefined,
  ): Chat | undefined => {
    const CHAT_CONFIG = window.meetingClientSettings.public.chat;
    const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
    const openChat = chats?.find((chat) => chat.chatId === openChatId);
    if (!openChat) return chats?.find((chat) => chat.chatId === PUBLIC_GROUP_CHAT_ID);
    return openChat;
  }, []);

  // Memoize chat IDs to prevent unnecessary re-renders when chat content changes
  // Only recalculate when the number of chats changes, not when messages are added/updated
  const chatIds = useMemo(() => (
    chats?.map((chat) => chat.chatId) || []
  ), [chats?.length]);

  return useMemo(() => {
    const activeChat = getActiveChat(chats, idChatOpen);
    const hasUnreadPrivateMessages = chats?.some((chat) => !chat.public && chat.totalUnread > 0) ?? false;

    return {
      totalUnreadMessages: isChatPanelOpened ? 0 : totalUnread,
      hasUnreadMessages: !isChatPanelOpened && totalUnread > 0,
      hasUnreadPrivateMessages,
      activeChat,
      chatIds,
    };
  }, [isChatPanelOpened, totalUnread, idChatOpen, getActiveChat, chatIds, chats]);
};

export default useHasUnreadChatMessages;
