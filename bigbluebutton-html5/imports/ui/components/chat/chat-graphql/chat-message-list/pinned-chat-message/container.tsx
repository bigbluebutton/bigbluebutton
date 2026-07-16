import React, {
  useMemo,
} from 'react';
import useChat from '/imports/ui/core/hooks/useChat';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import logger from '/imports/startup/client/logger';
import { Message } from '/imports/ui/Types/message';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import {
  CHAT_PINNED_MESSAGE_PUBLIC_SUBSCRIPTION,
  ChatMessageSubscriptionResponse,
} from './queries';
import { PinnedChatMessageProps } from './types';
import PinnedMessageComponent from './component';
import useStabilizedList from '/imports/ui/core/hooks/useStabilizedList';
import { useIsPinChatMessageEnabled } from '/imports/ui/services/features';

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

  const {
    data: pinnedMessageData,
    error: pinnedMessageError,
  } = useDeduplicatedSubscription<ChatMessageSubscriptionResponse>(
    CHAT_PINNED_MESSAGE_PUBLIC_SUBSCRIPTION,
    {
      variables: { messageId: pinnedMessageId },
      skip: !pinnedMessageId,
    },
  );

  const pinnedMessages: Message[] = pinnedMessageData?.chat_message_public ?? [];

  // prevents pinned message "blink" effect when a new message is pinned or unpinned
  const stabilized = useStabilizedList<Message>(pinnedMessages, {
    getId: (m) => m.messageId,
    expectedIds: pinnedMessageId ? [pinnedMessageId] : [],
    areEqual: (a, b) => (
      a[0]?.messageId === b[0]?.messageId
      && a[0]?.messageAsHtml === b[0]?.messageAsHtml
    ),
  });
  const displayedMessage = stabilized[0] ?? null;

  const { data: currentUser } = useCurrentUser((u) => ({ isModerator: u.isModerator }));

  const isModerator = currentUser?.isModerator ?? false;
  const chatPinningEnabled = useIsPinChatMessageEnabled();

  if (pinnedMessageError) {
    logger.error({
      logCode: 'pinned_message_subscription_error',
      extraInfo: { error: pinnedMessageError },
    }, `Error subscribing to pinned message: ${pinnedMessageError}`);
    return null;
  }
  if (!chatPinningEnabled || !isPublicChat || !openChatId) return null;
  if (!displayedMessage) return null;

  return (
    <PinnedMessageComponent message={displayedMessage} isModerator={isModerator} pinnedBy={pinnedBy} />
  );
};

export default PinnedChatMessageContainer;
