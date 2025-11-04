import { useMemo } from 'react';
import { Chat as ChatType } from '/imports/ui/Types/chat';

/**
 * Hook to handle edge case: when user opens empty private chat,
 * show chat toggle buttons to maintain access to public chat notifications
 */
const useEmptyPrivateChatVisibility = (
  chats: Partial<ChatType>[] | undefined,
  idChatOpen: string,
  publicChatId: string,
) => {
  return useMemo(() => {
    // No chat open or public chat open - buttons not needed
    if (!idChatOpen || idChatOpen === publicChatId) return false;

    // If there are already private chats with messages, buttons already visible
    const hasPrivateChatsWithMessages = chats?.some(
      (chat) => !chat.public && chat.totalMessages && chat.totalMessages > 0,
    );
    if (hasPrivateChatsWithMessages) return false;

    // Edge case: private chat is open but has no messages yet
    // User needs access to public chat notifications via toggle buttons
    const openChatExists = chats?.some((chat) => chat.chatId === idChatOpen);
    return openChatExists;
  }, [chats, idChatOpen, publicChatId]);
};

export default useEmptyPrivateChatVisibility;
