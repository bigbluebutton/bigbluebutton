/* eslint-disable @typescript-eslint/ban-ts-comment */
import React from 'react';
import {
  CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
  CHAT_MESSAGE_PRIVATE_SUBSCRIPTION,
} from './queries';
import { Message } from '/imports/ui/Types/message';
import ChatMessage from './chat-message/component';
import { useCreateUseSubscription } from '/imports/ui/core/hooks/createUseSubscription';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';

// @ts-ignore - temporary, while meteor exists in the project
const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

interface ChatListPageContainerProps {
  page: number;
  pageSize: number;
  setLastSender: (page: number, message: string) => void;
  lastSenderPreviousPage: string | undefined;
  // eslint-disable-next-line react/no-unused-prop-types
  lastSeenAt: string,
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
          key={message.createdAt}
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

  const useChatMessageSubscription = useCreateUseSubscription<Message>(chatQuery, variables, true);
  const {
    data: chatMessageData,
  } = useChatMessageSubscription((msg) => msg) as GraphqlDataHookSubscriptionResponse<Message[]>;

  if (chatMessageData) {
    if (chatMessageData.length > 0 && chatMessageData[chatMessageData.length - 1].user?.userId) {
      setLastSender(page, chatMessageData[chatMessageData.length - 1].user?.userId);
    }

    return (
      <ChatListPage
        messages={chatMessageData}
        lastSenderPreviousPage={lastSenderPreviousPage}
        page={page}
        markMessageAsSeen={markMessageAsSeen}
        scrollRef={scrollRef}
      />
    );
  } return (<></>);
};

export default ChatListPageContainer;
