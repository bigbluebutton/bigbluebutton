import React, {
  useMemo,
  useEffect,
} from 'react';
import useChat from '/imports/ui/core/hooks/useChat';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import logger from '/imports/startup/client/logger';
import { Message } from '/imports/ui/Types/message';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { usePinnedChatMessagesHidden, setPinnedChatMessagesHidden } from '/imports/ui/components/chat/chat-graphql/service';
import {
  CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
  ChatMessageSubscriptionResponse,
} from './queries';
import { PinnedChatMessageProps } from './types';
import PinnedMessageComponent from './component';
import useStabilizedList from '/imports/ui/core/hooks/useStabilizedList';
import { useIsChatPinningEnabled } from '/imports/ui/services/features';

export const PinnedChatMessageContainer: React.FC<PinnedChatMessageProps> = ({ openChatId }) => {
  const { data: chats } = useChat(
    (chat) => ({ chatId: chat.chatId, pinnedMessageId: chat.pinnedMessageId, pinnedBy: chat.pinnedBy }),
    { chatId: openChatId, skip: !openChatId },
  );

  const chat = useMemo(() => (
    Array.isArray(chats) ? chats.find((c) => c.chatId === openChatId) : chats
  ), [chats, openChatId]);

  const CHAT_CONFIG = window.meetingClientSettings?.public?.chat ?? {};
  const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

  const isPublicChat = openChatId && openChatId === PUBLIC_GROUP_CHAT_KEY;
  const pinnedMessageId = chat?.pinnedMessageId ?? null;
  const pinnedBy = chat?.pinnedBy ?? null;
  const pinnedMessagesIds = useMemo(() => (pinnedMessageId ? [pinnedMessageId] : []), [pinnedMessageId]);

  const {
    data: pinnedMessagesData,
    error: pinnedMessagesError,
  } = useDeduplicatedSubscription<ChatMessageSubscriptionResponse>(
    CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
    {
      variables: { messageIds: pinnedMessagesIds },
      skip: pinnedMessagesIds.length === 0,
    },
  );

  const pinnedMessages: Message[] = pinnedMessagesData?.chat_message_public || [];

  // prevents pinned messages "blink" effect when a new message is pinned or unpinned
  const displayedMessages = useStabilizedList<Message>(pinnedMessages, {
    getId: (m) => m.messageId,
    expectedIds: pinnedMessagesIds,
    areEqual: (a, b) => {
      if (a.length !== b.length) return false;
      for (let i = 0; i < a.length; i += 1) {
        if (a[i].messageId !== b[i].messageId) return false;
        if (a[i].message !== b[i].message) return false;
        if (a[i].editedAt !== b[i].editedAt) return false;
      }
      return true;
    },
  });

  const { data: currentUser } = useCurrentUser((u) => ({ isModerator: u.isModerator }));
  const isModerator = currentUser?.isModerator ?? false;
  const pinnedMessagesHidden = usePinnedChatMessagesHidden();
  const chatPinningEnabled = useIsChatPinningEnabled();

  useEffect(() => {
    // the pinned messages header shortcut should vanish when there is no pinned message.
    if (!isPublicChat || !openChatId || displayedMessages.length === 0) {
      setPinnedChatMessagesHidden(false);
    }
  }, [isPublicChat, openChatId, displayedMessages]);

  if (pinnedMessagesError) {
    logger.error({
      logCode: 'pinned_messages_subscription_error',
      extraInfo: { error: pinnedMessagesError },
    }, `Error subscribing to pinned messages: ${pinnedMessagesError}`);
    return null;
  }
  if (!chatPinningEnabled || pinnedMessagesHidden || !isPublicChat || !openChatId) return null;
  if (displayedMessages.length === 0) return null;

  return (
    <PinnedMessageComponent messages={displayedMessages} isModerator={isModerator} pinnedBy={pinnedBy} />
  );
};

export default PinnedChatMessageContainer;
