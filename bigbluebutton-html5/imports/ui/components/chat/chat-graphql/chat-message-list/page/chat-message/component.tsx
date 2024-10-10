import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { UpdatedEventDetailsForChatMessageDomElements } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/chat/message/types';
import { Message } from '/imports/ui/Types/message';
import { defineMessages, useIntl } from 'react-intl';
import ChatMessageHeader from './message-header/component';
import ChatMessageTextContent from './message-content/text-content/component';
import ChatPollContent from './message-content/poll-content/component';
import ChatMessagePresentationContent from './message-content/presentation-content/component';
import {
  ChatWrapper,
  ChatContent,
  ChatAvatar,
  MessageItemWrapper,
  Container,
} from './styles';
import { ChatEvents, ChatMessageType } from '/imports/ui/core/enums/chat';
import MessageReadConfirmation from './message-read-confirmation/component';
import ChatMessageToolbar from './message-toolbar/component';
import ChatMessageReactions from './message-reactions/component';
import ChatMessageReplied from './message-replied/component';
import { STORAGES, useStorageKey } from '/imports/ui/services/storage/hooks';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import useChat from '/imports/ui/core/hooks/useChat';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { Chat } from '/imports/ui/Types/chat';

interface ChatMessageProps {
  message: Message;
  previousMessage: Message;
  lastSenderPreviousPage: string | null | undefined;
  setMessagesRequestedFromPlugin: React.Dispatch<React.SetStateAction<UpdatedEventDetailsForChatMessageDomElements[]>>
  scrollRef: React.RefObject<HTMLDivElement>;
  markMessageAsSeen: (message: Message) => void;
  messageReadFeedbackEnabled: boolean;
}

const intlMessages = defineMessages({
  pollResult: {
    id: 'app.chat.pollResult',
    description: 'used in place of user name who published poll to chat',
  },
  systemLabel: {
    id: 'app.toast.chat.system',
    description: 'presentation area element label',
  },
  chatClear: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
  userAway: {
    id: 'app.chat.away',
    description: 'message when user is away',
  },
  userNotAway: {
    id: 'app.chat.notAway',
    description: 'message when user is no longer away',
  },
});

function isInViewport(el: HTMLDivElement) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) && rect.bottom >= 0
  );
}

const messageRef = React.createRef<HTMLDivElement>();

const ANIMATION_DURATION = 2000;

const ChatMesssage: React.FC<ChatMessageProps> = ({
  previousMessage,
  lastSenderPreviousPage,
  scrollRef,
  message,
  setMessagesRequestedFromPlugin,
  markMessageAsSeen,
  messageReadFeedbackEnabled,
}) => {
  const idChatOpen: string = layoutSelect((i: Layout) => i.idChatOpen);
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m?.lockSettings,
  }));
  const { data: currentUser } = useCurrentUser((c) => ({
    isModerator: c?.isModerator,
    userLockSettings: c?.userLockSettings,
    locked: c?.locked,
  }));
  const { data: chat } = useChat((c: Partial<Chat>) => ({
    participant: c?.participant,
    chatId: c?.chatId,
    public: c?.public,
  }), idChatOpen) as GraphqlDataHookSubscriptionResponse<Partial<Chat>>;
  const intl = useIntl();
  const markMessageAsSeenOnScrollEnd = useCallback(() => {
    if (messageRef.current && isInViewport(messageRef.current)) {
      markMessageAsSeen(message);
    }
  }, [message, messageRef]);
  const messageContentRef = React.createRef<HTMLDivElement>();
  const [reactions, setReactions] = React.useState<{ id: string, native: string }[]>([]);
  const chatFocusMessageRequest = useStorageKey(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, STORAGES.IN_MEMORY);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const animationInitialTimestamp = React.useRef(0);

  const isModerator = currentUser?.isModerator;
  const isPublicChat = chat?.public;
  const isLocked = currentUser?.locked || currentUser?.userLockSettings?.disablePublicChat;
  const disablePublicChat = meeting?.lockSettings?.disablePublicChat
    || currentUser?.userLockSettings?.disablePublicChat;
  const disablePrivateChat = meeting?.lockSettings?.disablePrivateChat;

  let locked = false;

  if (!isModerator) {
    if (isPublicChat) {
      locked = (isLocked && disablePublicChat) || false;
    } else {
      locked = (isLocked && disablePrivateChat) || false;
    }
  }

  const startScrollAnimation = (timestamp: number) => {
    if (scrollRef.current && containerRef.current) {
      // eslint-disable-next-line no-param-reassign
      scrollRef.current.scrollTop = containerRef.current.offsetTop;
    }
    animationInitialTimestamp.current = timestamp;
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        if (e.detail.sequence === message.messageSequence) {
          requestAnimationFrame(startScrollAnimation);
        }
      }
    };

    window.addEventListener(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, handler);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, handler);
    };
  }, []);

  useEffect(() => {
    if (chatFocusMessageRequest === message.messageSequence) {
      requestAnimationFrame(startScrollAnimation);
    }
  }, []);

  const animate = useCallback((timestamp: number) => {
    if (!containerRef.current) return;
    const value = (timestamp - animationInitialTimestamp.current) / ANIMATION_DURATION;
    if (value < 1) {
      containerRef.current.style.backgroundColor = `rgba(243, 246, 249, ${1 - value})`;
      requestAnimationFrame(animate);
    } else {
      containerRef.current.style.backgroundColor = 'unset';
    }
  }, []);

  useEffect(() => {
    setMessagesRequestedFromPlugin((messages) => {
      if (messageContentRef.current && !messages.some((m) => m.messageId === message.messageId)) {
        messages.push({
          messageId: message.messageId,
          message: messageContentRef.current,
        });
      }
      return messages;
    });
  }, [messageContentRef]);
  useEffect(() => {
    const callbackFunction = () => {
      if (messageRef.current && isInViewport(messageRef.current)) {
        markMessageAsSeen(message); // Pass the 'message' argument here
      }
    };
    if (message && scrollRef.current && messageRef.current) {
      if (isInViewport(messageRef.current)) {
        markMessageAsSeen(message);
      } else {
        scrollRef.current.addEventListener('scrollend', callbackFunction);
      }
    }
    return () => {
      scrollRef?.current?.removeEventListener('scrollend', callbackFunction);
    };
  }, [message, messageRef, markMessageAsSeenOnScrollEnd]);

  if (!message) return null;
  const pluginMessageNotCustom = (previousMessage?.messageType !== ChatMessageType.PLUGIN
    || !JSON.parse(previousMessage?.messageMetadata).custom);
  const sameSender = ((previousMessage?.user?.userId
    || lastSenderPreviousPage) === message?.user?.userId) && pluginMessageNotCustom;
  const isSystemSender = message.messageType === ChatMessageType.BREAKOUT_ROOM;
  const currentPluginMessageMetadata = message.messageType === ChatMessageType.PLUGIN
    && JSON.parse(message.messageMetadata);
  const isCustomPluginMessage = currentPluginMessageMetadata.custom;
  const dateTime = new Date(message?.createdAt);
  const formattedTime = intl.formatTime(dateTime, {
    hour: 'numeric',
    minute: 'numeric',
  });

  const msgTime = formattedTime;
  const clearMessage = `${msgTime} ${intl.formatMessage(intlMessages.chatClear)}`;

  const messageContent: {
    name: string,
    color: string,
    isModerator: boolean,
    isPresentationUpload?: boolean,
    component: React.ReactElement,
    avatarIcon?: string,
  } = useMemo(() => {
    switch (message.messageType) {
      case ChatMessageType.POLL:
        return {
          name: intl.formatMessage(intlMessages.pollResult),
          color: '#3B48A9',
          isModerator: true,
          component: (
            <ChatPollContent metadata={message.messageMetadata} />
          ),
          avatarIcon: 'icon-bbb-polling',
        };
      case ChatMessageType.PRESENTATION:
        return {
          name: '',
          color: '#0F70D7',
          isModerator: false,
          isPresentationUpload: true,
          component: (
            <ChatMessagePresentationContent
              metadata={message.messageMetadata}
            />
          ),
          avatarIcon: 'icon-bbb-download',
        };
      case ChatMessageType.CHAT_CLEAR:
        return {
          name: intl.formatMessage(intlMessages.systemLabel),
          color: '',
          isModerator: false,
          isSystemSender: true,
          component: (
            <ChatMessageTextContent
              emphasizedMessage={false}
              text={clearMessage}
              systemMsg
            />
          ),
        };
      case ChatMessageType.BREAKOUT_ROOM:
        return {
          name: message.senderName,
          color: '#0F70D7',
          isModerator: true,
          isSystemSender: true,
          component: (
            <ChatMessageTextContent
              systemMsg={false}
              emphasizedMessage
              text={message.message}
            />
          ),
        };
      case ChatMessageType.API:
        return {
          name: message.senderName,
          color: '#0F70D7',
          isModerator: true,
          isSystemSender: true,
          component: (
            <ChatMessageTextContent
              systemMsg
              emphasizedMessage
              text={message.message}
            />
          ),
        };
      case ChatMessageType.USER_AWAY_STATUS_MSG: {
        const { away } = JSON.parse(message.messageMetadata);
        const awayMessage = (away)
          ? `${intl.formatMessage(intlMessages.userAway)}`
          : `${intl.formatMessage(intlMessages.userNotAway)}`;
        return {
          name: message.senderName,
          color: '#0F70D7',
          isModerator: true,
          isSystemSender: true,
          component: (
            <ChatMessageTextContent
              emphasizedMessage={false}
              text={awayMessage}
              systemMsg
            />
          ),
        };
      }
      case ChatMessageType.PLUGIN: {
        return {
          name: message.user?.name,
          color: message.user?.color,
          isModerator: message.user?.isModerator,
          isSystemSender: false,
          component: currentPluginMessageMetadata.custom
            ? (<></>)
            : (
              <ChatMessageTextContent
                emphasizedMessage={message.chatEmphasizedText}
                text={message.message}
                systemMsg={false}
              />
            ),
        };
      }
      case ChatMessageType.TEXT:
      default:
        return {
          name: message.user?.name,
          color: message.user?.color,
          isModerator: message.user?.isModerator,
          isSystemSender: ChatMessageType.BREAKOUT_ROOM,
          component: (
            <ChatMessageTextContent
              emphasizedMessage={message.chatEmphasizedText}
              text={message.message}
              systemMsg={false}
            />
          ),
        };
    }
  }, []);
  return (
    <Container ref={containerRef}>
      <ChatWrapper
        id="chat-message-wrapper"
        isSystemSender={isSystemSender}
        sameSender={sameSender}
        ref={messageRef}
        isPresentationUpload={messageContent.isPresentationUpload}
        isCustomPluginMessage={isCustomPluginMessage}
      >
        {!isSystemSender && message.user && !locked && (
          <ChatMessageToolbar
            messageId={message.messageId}
            chatId={message.chatId}
            username={message.user.name}
            message={message.message}
            messageSequence={message.messageSequence}
            emphasizedMessage={message.chatEmphasizedText}
            onEmojiSelected={(emoji) => {
              setReactions((prev) => {
                return [
                  ...prev,
                  emoji,
                ];
              });
            }}
          />
        )}
        <ChatMessageReactions reactions={reactions} />
        {((!message?.user || !sameSender) && (
          message.messageType !== ChatMessageType.USER_AWAY_STATUS_MSG
        && message.messageType !== ChatMessageType.API
        && message.messageType !== ChatMessageType.CHAT_CLEAR
        && !isCustomPluginMessage)
        ) && (
        <ChatAvatar
          avatar={message.user?.avatar}
          color={messageContent.color}
          moderator={messageContent.isModerator}
        >
          {!messageContent.avatarIcon ? (
            !message.user || (message.user?.avatar.length === 0 ? messageContent.name.toLowerCase().slice(0, 2) : '')
          ) : (
            <i className={messageContent.avatarIcon} />
          )}
        </ChatAvatar>
        )}
        <ChatContent
          ref={messageContentRef}
          sameSender={message?.user ? sameSender : false}
          isCustomPluginMessage={isCustomPluginMessage}
          data-chat-message-id={message?.messageId}
        >
          {message.messageType !== ChatMessageType.CHAT_CLEAR
          && !isCustomPluginMessage
          && (
            <ChatMessageHeader
              sameSender={message?.user ? sameSender : false}
              name={messageContent.name}
              currentlyInMeeting={message.user?.currentlyInMeeting ?? true}
              dateTime={dateTime}
            />
          )}
          {message.replyToMessage && (
          <ChatMessageReplied
            message={message.replyToMessage.message}
            username={message.replyToMessage.user.name}
            sequence={message.replyToMessage.messageSequence}
            userColor={message.replyToMessage.user.color}
            emphasizedMessage={message.replyToMessage.chatEmphasizedText}
          />
          )}
          <MessageItemWrapper>
            {messageContent.component}
            {messageReadFeedbackEnabled && (
            <MessageReadConfirmation
              message={message}
            />
            )}
          </MessageItemWrapper>
        </ChatContent>
      </ChatWrapper>
    </Container>
  );
};

function areChatMessagesEqual(prevProps: ChatMessageProps, nextProps: ChatMessageProps) {
  const prevMessage = prevProps?.message;
  const nextMessage = nextProps?.message;
  return prevMessage?.createdAt === nextMessage?.createdAt
    && prevMessage?.user?.currentlyInMeeting === nextMessage?.user?.currentlyInMeeting
    && prevMessage?.recipientHasSeen === nextMessage.recipientHasSeen;
}

export default memo(ChatMesssage, areChatMessagesEqual);
