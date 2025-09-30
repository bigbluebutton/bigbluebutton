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
}

const useHasUnreadChatMessages = ({ isChatPanelOpened }: UseUnreadChatMessagesProps) => {
  const [totalUnread, setTotalUnread] = useState(0);
  const [isLatched, setIsLatched] = useState(false);
  const [lastKnownTotal, setLastKnownTotal] = useState(0);

  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);

  const skipSubscription = isChatPanelOpened;

  const { data: chats } = useChat((chat) => chat) as GraphqlDataHookSubscriptionResponse<Chat[]>;

  const calculateTotalUnreadMessages = useCallback(
    (chats: Chat[] | null | undefined): number => (
      chats?.reduce((acc, chat) => acc + chat.totalUnread, 0) || 0
    ),
    [],
  );

  useEffect(() => {
    if (skipSubscription || isLatched || !chats) return;

    const currentTotal = calculateTotalUnreadMessages(chats);

    if (currentTotal > lastKnownTotal) {
      setIsLatched(true);
      setTotalUnread(currentTotal);
    } else {
      setLastKnownTotal(currentTotal);
      setTotalUnread(currentTotal);
    }
  }, [chats, calculateTotalUnreadMessages, lastKnownTotal, isLatched, skipSubscription]);

  const resetLatch = useCallback(() => {
    if (!chats) return;

    const currentTotal = calculateTotalUnreadMessages(chats);
    setIsLatched(false);
    setTotalUnread(currentTotal);
    setLastKnownTotal(currentTotal);
  }, [chats, calculateTotalUnreadMessages]);

  useEffect(() => {
    if (skipSubscription && isLatched) {
      resetLatch();
    }
  }, [skipSubscription, isLatched, resetLatch]);

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

    return {
      totalUnreadMessages: isChatPanelOpened ? 0 : totalUnread,
      hasUnreadMessages: !isChatPanelOpened && totalUnread > 0,
      activeChat,
      chatIds,
      resetLatch,
    };
  }, [isChatPanelOpened, totalUnread, idChatOpen, getActiveChat, chats, resetLatch, chatIds]);
};

export default useHasUnreadChatMessages;
