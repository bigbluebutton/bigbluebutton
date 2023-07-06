import React, { useEffect } from "react";
import { useSubscription } from "@apollo/client";
import { Meteor } from 'meteor/meteor';
import {
  CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
  CHAT_MESSAGE_PRIVATE_SUBSCRIPTION,
  ChatMessagePrivateSubscriptionResponse,
  ChatMessagePublicSubscriptionResponse,
} from "./queries";
import { Message } from '/imports/ui/Types/message';
import ChatMessage from './chat-message/componet';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

interface ChatListPageContainerProps {
  page: number;
  pageSize: number;
  setLastSender: Function;
  lastSenderPreviousPage: string | undefined;
  chatId: string;
  markMessageAsSeen: Function;
  scrollRef: React.RefObject<HTMLDivElement>;
}

interface ChatListPageProps {
  messages: Array<Message>;
  lastSenderPreviousPage: string | undefined;
  page: number;
  markMessageAsSeen: Function;
  scrollRef: React.RefObject<HTMLDivElement>;
}

const verifyIfIsPublicChat = (message: unknown): message is ChatMessagePublicSubscriptionResponse => {
  return (message as ChatMessagePublicSubscriptionResponse).chat_message_public !== undefined;
}

const verifyIfIsPrivateChat = (message: unknown): message is ChatMessagePrivateSubscriptionResponse => {
  return (message as ChatMessagePrivateSubscriptionResponse).chat_message_private !== undefined;
}

const ChatListPage: React.FC<ChatListPageProps> = ({
  messages,
  lastSenderPreviousPage,
  page,
  markMessageAsSeen,
  scrollRef,

}) => {
  return (
    <div key={`messagePage-${page}`} id={`${page}`} >
      {
        messages.map((message, index, Array) => {
          const previousMessage = Array[index - 1];
          return (
            <ChatMessage
              key={message.createdTime}
              message={message}
              previousMessage={previousMessage}
              lastSenderPreviousPage={!previousMessage ? lastSenderPreviousPage : null}
              scrollRef={scrollRef}
              markMessageAsSeen={markMessageAsSeen}
            />
          )
        })
      }
    </div>
  );
}

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
  const variables = isPublicChat ? defaultVariables : { ...defaultVariables, requestedChatId: chatId };
  const {
    data: chatMessageData,
    loading: chatMessageLoading,
    error: chatMessageError,
  } = useSubscription<ChatMessagePublicSubscriptionResponse | ChatMessagePrivateSubscriptionResponse>(
    chatQuery,
    { variables }
  );

  if (chatMessageError) return (<p>chatMessageError: {JSON.stringify(chatMessageError)}</p>);
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
}

export default ChatListPageContainer;
