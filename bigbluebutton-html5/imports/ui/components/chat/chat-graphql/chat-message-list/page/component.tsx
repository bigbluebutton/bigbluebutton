import React from 'react';
import { useSubscription } from '@apollo/client';
import {
  CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
  CHAT_MESSAGE_PRIVATE_SUBSCRIPTION,
  ChatMessagePrivateSubscriptionResponse,
  ChatMessagePublicSubscriptionResponse,
} from './queries';
import { Message } from '/imports/ui/Types/message';
import ChatMessage from './chat-message/componet';

// @ts-ignore - temporary, while meteor exists in the project
const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

interface ChatListPageContainerProps {
  page: number;
  pageSize: number;
  setLastSender: (page: number, message: string) => void;
  lastSenderPreviousPage: string | undefined;
  // eslint-disable-next-line react/no-unused-prop-types
  lastSeenAt: number,
  chatId: string;
  markMessageAsSeen: (message: Message) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

interface ChatListPageProps {
  messages: Array<Message>;
  lastSenderPreviousPage: string | undefined;
  page: number;
  markMessageAsSeen: (message: Message)=> void;
  scrollRef: React.RefObject<HTMLDivElement>;
}

const verifyIfIsPublicChat = (message: unknown):
// eslint-disable-next-line max-len
message is ChatMessagePublicSubscriptionResponse => (message as ChatMessagePublicSubscriptionResponse).chat_message_public !== undefined;

// eslint-disable-next-line max-len
const verifyIfIsPrivateChat = (message: unknown): message is ChatMessagePrivateSubscriptionResponse => (message as ChatMessagePrivateSubscriptionResponse).chat_message_private !== undefined

const ChatListPage: React.FC<ChatListPageProps> = ({
  messages,
  lastSenderPreviousPage,
  page,
  markMessageAsSeen,
  scrollRef,
}) => (
  // eslint-disable-next-line react/jsx-filename-extension
  <div key={`messagePage-${page}`} id={`${page}`}>
    {messages.map((message, index, Array) => {
      const previousMessage = Array[index - 1];
      return (
        <ChatMessage
          key={message.createdTime}
          message={message}
          previousMessage={previousMessage}
          lastSenderPreviousPage={
            !previousMessage ? lastSenderPreviousPage : null
          }
          scrollRef={scrollRef}
          markMessageAsSeen={markMessageAsSeen}
        />
      );
    })}
  </div>
);

const ChatListPageContainer: React.FC<ChatListPageContainerProps> = ({
  page,
  pageSize,
  setLastSender,
  lastSenderPreviousPage,
  chatId,
  markMessageAsSeen,
  scrollRef,
}) => {
  const isPublicChat = chatId === PUBLIC_GROUP_CHAT_KEY;
  const chatQuery = isPublicChat
    ? CHAT_MESSAGE_PUBLIC_SUBSCRIPTION
    : CHAT_MESSAGE_PRIVATE_SUBSCRIPTION;
  const defaultVariables = { offset: (page) * pageSize, limit: pageSize };
  const variables = isPublicChat
    ? defaultVariables : { ...defaultVariables, requestedChatId: chatId };
  const {
    data: chatMessageData,
    loading: chatMessageLoading,
    error: chatMessageError,
  } = useSubscription<ChatMessagePublicSubscriptionResponse|ChatMessagePrivateSubscriptionResponse>(
    chatQuery,
    { variables },
  );

  if (chatMessageError) {
    return (
      <p>
        chatMessageError:
        {JSON.stringify(chatMessageError)}
      </p>
    );
  }
  if (chatMessageLoading) return null;
  let messages: Array<Message> = [];
  if (verifyIfIsPublicChat(chatMessageData)) {
    messages = chatMessageData.chat_message_public || [];
  } else if (verifyIfIsPrivateChat(chatMessageData)) {
    messages = chatMessageData.chat_message_private || [];
  }

  if (messages.length > 0) {
    setLastSender(page, messages[messages.length - 1].user?.userId);
  }

  return (
    <ChatListPage
      messages={messages}
      lastSenderPreviousPage={lastSenderPreviousPage}
      page={page}
      markMessageAsSeen={markMessageAsSeen}
      scrollRef={scrollRef}
    />
  );
};

export default ChatListPageContainer;
