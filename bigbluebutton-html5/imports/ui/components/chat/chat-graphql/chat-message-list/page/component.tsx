import React, {
  useContext,
  useEffect,
  useState,
  memo,
  useRef,
  useCallback,
} from 'react';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import {
  UpdatedEventDetailsForChatMessageDomElements,
  MessageDetails,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/chat/message/types';
import { HookEvents } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import { DomElementManipulationHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/enums';
import {
  CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
  CHAT_MESSAGE_PRIVATE_SUBSCRIPTION,
} from './queries';
import { Message } from '/imports/ui/Types/message';
import ChatMessage, { ChatMessageRef } from './chat-message/component';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { useCreateUseSubscription } from '/imports/ui/core/hooks/createUseSubscription';
import { setLoadedMessageGathering } from '/imports/ui/core/hooks/useLoadedChatMessages';
import { ChatLoading } from '../../component';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import { useStorageKey, STORAGES } from '/imports/ui/services/storage/hooks';
import { getValueByPointer } from '/imports/utils/object-utils';

const PAGE_SIZE = 50;

interface ChatListPageCommonProps {
  firstPageToLoad: number;
  focusedId: number | null;
  scrollRef: React.RefObject<HTMLDivElement>;
  markMessageAsSeen: (message: Message) => void;
  lastSenderPreviousPage: string | undefined;
  page: number;
  meetingDisablePublicChat: boolean;
  meetingDisablePrivateChat: boolean;
  currentUserIsModerator: boolean;
  currentUserIsLocked: boolean;
  currentUserId: string;
  currentUserDisablePublicChat: boolean;
  messageToolbarIsEnabled: boolean;
  chatReplyEnabled: boolean;
  chatDeleteEnabled: boolean;
  chatEditEnabled: boolean;
  chatReactionsEnabled: boolean;
  sendReaction: (reactionEmoji: string, reactionEmojiId: string, chatId: string, messageId: string) => void;
  deleteReaction: (reactionEmoji: string, reactionEmojiId: string, chatId: string, messageId: string) => void;
}

interface ChatListPageContainerProps extends ChatListPageCommonProps {
  pageSize: number;
  setLastSender: (page: number, message: string) => void;
  chatId: string;
}

interface ChatListPageProps extends ChatListPageCommonProps {
  messages: Array<Message>;
  messageReadFeedbackEnabled: boolean;
  isPublicChat: boolean;
}

const propsToCompare = [
  'focusedId',
  'meetingDisablePublicChat',
  'meetingDisablePrivateChat',
  'currentUserDisablePublicChat',
  'currentUserId',
  'currentUserIsLocked',
  'currentUserIsModerator',
  'chatDeleteEnabled',
  'chatEditEnabled',
  'chatReactionsEnabled',
  'chatReplyEnabled',
] as const;
const messagePropsToCompare = [
  'messageId',
  'createdAt',
  'user.currentlyInMeeting',
  'recipientHasSeen',
  'message',
  'reactions.length',
] as const;

const areChatPagesEqual = (prevProps: ChatListPageProps, nextProps: ChatListPageProps) => {
  const nextMessages = nextProps?.messages || [];
  const prevMessages = prevProps?.messages || [];
  if (nextMessages.length !== prevMessages.length) return false;
  return nextMessages.every((nextMessage, idx) => {
    const prevMessage = prevMessages[idx];
    return messagePropsToCompare.every((pointer) => {
      const previousValue = getValueByPointer(prevMessage, pointer);
      const nextValue = getValueByPointer(nextMessage, pointer);
      return previousValue === nextValue;
    });
  }) && propsToCompare.every((pointer) => {
    const previousValue = getValueByPointer(prevProps, pointer);
    const nextValue = getValueByPointer(nextProps, pointer);
    return previousValue === nextValue;
  });
};

const ChatListPage: React.FC<ChatListPageProps> = ({
  messages,
  messageReadFeedbackEnabled,
  lastSenderPreviousPage,
  page,
  markMessageAsSeen,
  scrollRef,
  focusedId,
  firstPageToLoad,
  meetingDisablePrivateChat,
  meetingDisablePublicChat,
  currentUserId,
  currentUserDisablePublicChat,
  currentUserIsLocked,
  currentUserIsModerator,
  isPublicChat,
  messageToolbarIsEnabled,
  chatDeleteEnabled,
  chatEditEnabled,
  chatReactionsEnabled,
  chatReplyEnabled,
  deleteReaction,
  sendReaction,
}) => {
  const { domElementManipulationIdentifiers } = useContext(PluginsContext);
  const messageRefs = useRef<Record<number, ChatMessageRef | null>>({});
  const chatFocusMessageRequest = useStorageKey(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, STORAGES.IN_MEMORY);
  const [keyboardFocusedMessageSequence, setKeyboardFocusedMessageSequence] = useState<number | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [renderedChatMessages, setRenderedChatMessages] = useState<MessageDetails[]>([]);
  useEffect(() => {
    const requestedMessages = renderedChatMessages.filter((
      chatMessageRequested,
    ) => domElementManipulationIdentifiers.CHAT_MESSAGE?.includes(chatMessageRequested.messageId));

    if (renderedChatMessages.length === messages.length) {
      // Only dispatch event when all messages from the page have been rendered
      // and dom elements registered in the components state
      window.dispatchEvent(
        new CustomEvent<UpdatedEventDetails<
          UpdatedEventDetailsForChatMessageDomElements>>(HookEvents.BBB_CORE_SENT_NEW_DATA, {
            detail: {
              hook: DomElementManipulationHooks.CHAT_MESSAGE,
              data: {
                page,
                messages: requestedMessages,
              },
            },
          }),
      );
    }

    return () => {
      // The page has unmounted, send an event to indicate this to the plugins sdk
      window.dispatchEvent(
        new CustomEvent<UpdatedEventDetails<
          UpdatedEventDetailsForChatMessageDomElements>>(HookEvents.BBB_CORE_SENT_NEW_DATA, {
            detail: {
              hook: DomElementManipulationHooks.CHAT_MESSAGE,
              data: {
                page,
                messages: [],
              },
            },
          }),
      );
    };
  }, [domElementManipulationIdentifiers, renderedChatMessages]);

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

    const handleFocusMessageRequest = (e: Event) => {
      if (e instanceof CustomEvent) {
        if (e.detail.sequence) {
          if (Math.ceil(e.detail.sequence / PAGE_SIZE) < firstPageToLoad) {
            return;
          }
          messageRefs.current[Number.parseInt(e.detail.sequence, 10)]?.requestFocus();
        }
      }
    };

    const handleChatEditRequest = (e: Event) => {
      if (e instanceof CustomEvent) {
        setEditingId(e.detail.messageId);
      }
    };

    const handleCancelChatEditRequest = (e: Event) => {
      if (e instanceof CustomEvent) {
        setEditingId(null);
      }
    };

    window.addEventListener(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_REQUEST, handleKeyboardFocusMessageRequest);
    window.addEventListener(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_CANCEL, handleKeyboardFocusMessageCancel);
    window.addEventListener(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, handleFocusMessageRequest);
    window.addEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleChatEditRequest);
    window.addEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelChatEditRequest);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_REQUEST, handleKeyboardFocusMessageRequest);
      window.removeEventListener(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_CANCEL, handleKeyboardFocusMessageCancel);
      window.removeEventListener(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, handleFocusMessageRequest);
      window.removeEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleChatEditRequest);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelChatEditRequest);
    };
  }, [firstPageToLoad]);

  useEffect(() => {
    if (typeof chatFocusMessageRequest === 'number') {
      messageRefs.current[chatFocusMessageRequest]?.requestFocus();
    }
  }, []);

  const updateMessageRef = useCallback((ref: ChatMessageRef | null) => {
    if (!ref) return;
    messageRefs.current[ref.sequence] = ref;
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
            setRenderedChatMessages={setRenderedChatMessages}
            lastSenderPreviousPage={
              !previousMessage ? lastSenderPreviousPage : null
            }
            scrollRef={scrollRef}
            markMessageAsSeen={markMessageAsSeen}
            messageReadFeedbackEnabled={messageReadFeedbackEnabled}
            focused={focusedId === message.messageSequence}
            keyboardFocused={keyboardFocusedMessageSequence === message.messageSequence}
            editing={editingId === message.messageId}
            ref={updateMessageRef}
            meetingDisablePrivateChat={meetingDisablePrivateChat}
            meetingDisablePublicChat={meetingDisablePublicChat}
            currentUserId={currentUserId}
            currentUserDisablePublicChat={currentUserDisablePublicChat}
            currentUserIsLocked={currentUserIsLocked}
            currentUserIsModerator={currentUserIsModerator}
            isPublicChat={isPublicChat}
            hasToolbar={messageToolbarIsEnabled && !!message.user}
            chatDeleteEnabled={chatDeleteEnabled}
            chatEditEnabled={chatEditEnabled}
            chatReactionsEnabled={chatReactionsEnabled}
            chatReplyEnabled={chatReplyEnabled}
            deleteReaction={deleteReaction}
            sendReaction={sendReaction}
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
  firstPageToLoad,
  meetingDisablePrivateChat,
  meetingDisablePublicChat,
  currentUserId,
  currentUserDisablePublicChat,
  currentUserIsLocked,
  currentUserIsModerator,
  messageToolbarIsEnabled,
  chatDeleteEnabled,
  chatEditEnabled,
  chatReactionsEnabled,
  chatReplyEnabled,
  deleteReaction,
  sendReaction,
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
      firstPageToLoad={firstPageToLoad}
      meetingDisablePrivateChat={meetingDisablePrivateChat}
      meetingDisablePublicChat={meetingDisablePublicChat}
      currentUserId={currentUserId}
      currentUserDisablePublicChat={currentUserDisablePublicChat}
      currentUserIsLocked={currentUserIsLocked}
      currentUserIsModerator={currentUserIsModerator}
      isPublicChat={isPublicChat}
      messageToolbarIsEnabled={messageToolbarIsEnabled}
      chatDeleteEnabled={chatDeleteEnabled}
      chatEditEnabled={chatEditEnabled}
      chatReactionsEnabled={chatReactionsEnabled}
      chatReplyEnabled={chatReplyEnabled}
      deleteReaction={deleteReaction}
      sendReaction={sendReaction}
    />
  );
};

export default ChatListPageContainer;
