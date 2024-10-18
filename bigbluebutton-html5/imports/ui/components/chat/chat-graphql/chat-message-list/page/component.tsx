import React, {
  useContext,
  useEffect,
  useState,
  memo,
} from 'react';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { UpdatedEventDetailsForChatMessageDomElements } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/chat/message/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { DomElementManipulationHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/enums';
import {
  CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
  CHAT_MESSAGE_PRIVATE_SUBSCRIPTION,
} from './queries';
import { Message } from '/imports/ui/Types/message';
import ChatMessage from './chat-message/component';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { useCreateUseSubscription } from '/imports/ui/core/hooks/createUseSubscription';
import { setLoadedMessageGathering } from '/imports/ui/core/hooks/useLoadedChatMessages';
import { ChatLoading } from '../../component';
import { ChatEvents } from '/imports/ui/core/enums/chat';

interface ChatListPageContainerProps {
  page: number;
  pageSize: number;
  setLastSender: (page: number, message: string) => void;
  lastSenderPreviousPage: string | undefined;
  chatId: string;
  markMessageAsSeen: (message: Message) => void;
  scrollRef: React.RefObject<HTMLDivElement>;
  focusedId: number | null;
}

interface ChatListPageProps {
  messages: Array<Message>;
  messageReadFeedbackEnabled: boolean;
  lastSenderPreviousPage: string | undefined;
  page: number;
  markMessageAsSeen: (message: Message)=> void;
  scrollRef: React.RefObject<HTMLDivElement>;
  focusedId: number | null;
}

const areChatPagesEqual = (prevProps: ChatListPageProps, nextProps: ChatListPageProps) => {
  const nextMessages = nextProps?.messages || [];
  const prevMessages = prevProps?.messages || [];
  if (nextMessages.length !== prevMessages.length) return false;
  return nextMessages.every((nextMessage, idx) => {
    const prevMessage = prevMessages[idx];
    return (prevMessage.messageId === nextMessage.messageId
      && prevMessage.createdAt === nextMessage.createdAt
      && prevMessage?.user?.currentlyInMeeting === nextMessage?.user?.currentlyInMeeting
      && prevMessage?.recipientHasSeen === nextMessage?.recipientHasSeen
      && prevMessage?.message === nextMessage?.message
      && prevMessage?.reactions?.length === nextMessage?.reactions?.length
    );
  }) && prevProps.focusedId === nextProps.focusedId;
};

const ChatListPage: React.FC<ChatListPageProps> = ({
  messages,
  messageReadFeedbackEnabled,
  lastSenderPreviousPage,
  page,
  markMessageAsSeen,
  scrollRef,
  focusedId,
}) => {
  const { domElementManipulationIdentifiers } = useContext(PluginsContext);

  const [messagesRequestedFromPlugin, setMessagesRequestedFromPlugin] = useState<
    UpdatedEventDetailsForChatMessageDomElements[]>([]);
  useEffect(() => {
    const dataToSend = messagesRequestedFromPlugin.filter((
      chatMessageRequested,
    ) => domElementManipulationIdentifiers.CHAT_MESSAGE?.includes(chatMessageRequested.messageId));
    window.dispatchEvent(
      new CustomEvent<UpdatedEventDetails<
        UpdatedEventDetailsForChatMessageDomElements[]>>(HookEvents.BBB_CORE_SENT_NEW_DATA, {
          detail: {
            hook: DomElementManipulationHooks.CHAT_MESSAGE,
            data: dataToSend,
          },
        }),
    );
  }, [domElementManipulationIdentifiers, messagesRequestedFromPlugin]);

  const [keyboardFocusedMessageSequence, setKeyboardFocusedMessageSequence] = useState<number | null>(null);
  useEffect(() => {
    const handleKeyboardFocusMessageRequest = (e: Event) => {
      if (e instanceof CustomEvent) {
        setKeyboardFocusedMessageSequence(Number.parseInt(e.detail.sequence, 10));
      }
    };

    const handleKeyboardFocusMessageCancel = (e: Event) => {
      if (e instanceof CustomEvent) {
        setKeyboardFocusedMessageSequence(null);
      }
    };

    window.addEventListener(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_REQUEST, handleKeyboardFocusMessageRequest);
    window.addEventListener(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_CANCEL, handleKeyboardFocusMessageCancel);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_REQUEST, handleKeyboardFocusMessageRequest);
      window.removeEventListener(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_CANCEL, handleKeyboardFocusMessageCancel);
    };
  }, []);

  return (
    <React.Fragment key={`messagePage-${page}`}>
      {messages.map((message, index, messagesArray) => {
        const previousMessage = messagesArray[index - 1];
        return (
          <ChatMessage
            key={message.createdAt}
            message={message}
            previousMessage={previousMessage}
            setMessagesRequestedFromPlugin={setMessagesRequestedFromPlugin}
            lastSenderPreviousPage={
              !previousMessage ? lastSenderPreviousPage : null
            }
            scrollRef={scrollRef}
            markMessageAsSeen={markMessageAsSeen}
            messageReadFeedbackEnabled={messageReadFeedbackEnabled}
            focused={focusedId === message.messageSequence}
            keyboardFocused={keyboardFocusedMessageSequence === message.messageSequence}
          />
        );
      })}
    </React.Fragment>
  );
};

const MemoizedChatListPage = memo(ChatListPage, areChatPagesEqual);

const ChatListPageContainer: React.FC<ChatListPageContainerProps> = ({
  page,
  pageSize,
  setLastSender,
  lastSenderPreviousPage,
  chatId,
  markMessageAsSeen,
  scrollRef,
  focusedId,
}) => {
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;
  const PRIVATE_MESSAGE_READ_FEEDBACK_ENABLED = CHAT_CONFIG.privateMessageReadFeedback.enabled;

  const isPublicChat = chatId === PUBLIC_GROUP_CHAT_KEY;
  const chatQuery = isPublicChat
    ? CHAT_MESSAGE_PUBLIC_SUBSCRIPTION
    : CHAT_MESSAGE_PRIVATE_SUBSCRIPTION;
  const defaultVariables = { offset: (page) * pageSize, limit: pageSize };
  const variables = isPublicChat
    ? defaultVariables : { ...defaultVariables, requestedChatId: chatId };
  const isPrivateReadFeedbackEnabled = !isPublicChat && PRIVATE_MESSAGE_READ_FEEDBACK_ENABLED;

  const useChatMessageSubscription = useCreateUseSubscription<Message>(chatQuery, variables);
  const {
    data: chatMessageData,
  } = useChatMessageSubscription((msg) => msg) as GraphqlDataHookSubscriptionResponse<Message[]>;

  useEffect(() => {
    // component will unmount
    return () => {
      setLoadedMessageGathering(page, []);
    };
  }, []);

  if (!chatMessageData) return null;
  if (chatMessageData.length > 0 && chatId !== chatMessageData[0].chatId) return <ChatLoading isRTL={document.dir === 'rtl'} />;
  if (chatMessageData.length > 0 && chatMessageData[chatMessageData.length - 1].user?.userId) {
    setLastSender(page, chatMessageData[chatMessageData.length - 1].user?.userId);
  }
  setLoadedMessageGathering(page, chatMessageData);
  return (
    <MemoizedChatListPage
      messages={chatMessageData}
      lastSenderPreviousPage={lastSenderPreviousPage}
      messageReadFeedbackEnabled={isPrivateReadFeedbackEnabled}
      page={page}
      markMessageAsSeen={markMessageAsSeen}
      scrollRef={scrollRef}
      focusedId={focusedId}
    />
  );
};

export default ChatListPageContainer;
