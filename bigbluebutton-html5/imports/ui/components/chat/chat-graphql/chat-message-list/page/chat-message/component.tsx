import React, {
  memo,
  useCallback,
  useEffect,
  useMemo,
} from 'react';
import { useMutation } from '@apollo/client';
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
  DeleteMessage,
  ChatHeading,
  EditLabel,
  EditLabelWrapper,
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
import { CHAT_DELETE_REACTION_MUTATION, CHAT_SEND_REACTION_MUTATION } from './mutations';
import Icon from '/imports/ui/components/common/icon/component';
import { colorBlueLightestChannel } from '/imports/ui/stylesheets/styled-components/palette';
import {
  useIsReplyChatMessageEnabled,
  useIsChatMessageReactionsEnabled,
  useIsEditChatMessageEnabled,
  useIsDeleteChatMessageEnabled,
} from '/imports/ui/services/features';
import ChatMessageNotificationContent from './message-content/notification-content/component';

interface ChatMessageProps {
  message: Message;
  previousMessage: Message;
  lastSenderPreviousPage: string | null | undefined;
  setMessagesRequestedFromPlugin: React.Dispatch<React.SetStateAction<UpdatedEventDetailsForChatMessageDomElements[]>>
  scrollRef: React.RefObject<HTMLDivElement>;
  markMessageAsSeen: (message: Message) => void;
  messageReadFeedbackEnabled: boolean;
  focused: boolean;
  keyboardFocused: boolean;
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
  editTime: {
    id: 'app.chat.editTime',
    description: '',
  },
  deleteMessage: {
    id: 'app.chat.deleteMessage',
    description: '',
  },
  edited: {
    id: 'app.chat.toolbar.edit.edited',
    description: 'edited message label',
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
  focused,
  keyboardFocused,
}) => {
  const idChatOpen: string = layoutSelect((i: Layout) => i.idChatOpen);
  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m?.lockSettings,
  }));
  const { data: currentUser } = useCurrentUser((c) => ({
    isModerator: c?.isModerator,
    userLockSettings: c?.userLockSettings,
    locked: c?.locked,
    userId: c.userId,
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
  const [editing, setEditing] = React.useState(false);
  const [isToolbarReactionPopoverOpen, setIsToolbarReactionPopoverOpen] = React.useState(false);
  const chatFocusMessageRequest = useStorageKey(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, STORAGES.IN_MEMORY);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const animationInitialTimestamp = React.useRef(0);
  const [chatSendReaction] = useMutation(CHAT_SEND_REACTION_MUTATION);
  const [chatDeleteReaction] = useMutation(CHAT_DELETE_REACTION_MUTATION);

  const sendReaction = useCallback((reactionEmoji: string) => {
    chatSendReaction({
      variables: {
        chatId: message.chatId,
        messageId: message.messageId,
        reactionEmoji,
      },
    });
  }, []);

  const deleteReaction = useCallback((reactionEmoji: string) => {
    chatDeleteReaction({
      variables: {
        chatId: message.chatId,
        messageId: message.messageId,
        reactionEmoji,
      },
    });
  }, []);

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

  const CHAT_REPLY_ENABLED = useIsReplyChatMessageEnabled();
  const CHAT_REACTIONS_ENABLED = useIsChatMessageReactionsEnabled();
  const CHAT_EDIT_ENABLED = useIsEditChatMessageEnabled();
  const CHAT_DELETE_ENABLED = useIsDeleteChatMessageEnabled();

  const hasToolbar = !!message.user && [
    CHAT_REPLY_ENABLED,
    CHAT_REACTIONS_ENABLED,
    CHAT_EDIT_ENABLED,
    CHAT_DELETE_ENABLED,
  ].some((config) => config);

  const startScrollAnimation = (timestamp: number) => {
    if (scrollRef.current && containerRef.current) {
      // eslint-disable-next-line no-param-reassign
      scrollRef.current.scrollTop = containerRef.current.offsetTop;
    }
    animationInitialTimestamp.current = timestamp;
    requestAnimationFrame(animate);
  };

  useEffect(() => {
    const handleFocusMessageRequest = (e: Event) => {
      if (e instanceof CustomEvent) {
        if (e.detail.sequence === message.messageSequence) {
          requestAnimationFrame(startScrollAnimation);
        }
      }
    };

    const handleChatEditRequest = (e: Event) => {
      if (e instanceof CustomEvent) {
        const editing = e.detail.messageId === message.messageId;
        setEditing(editing);
      }
    };

    const handleCancelChatEditRequest = (e: Event) => {
      if (e instanceof CustomEvent) {
        setEditing(false);
      }
    };

    window.addEventListener(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, handleFocusMessageRequest);
    window.addEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleChatEditRequest);
    window.addEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelChatEditRequest);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, handleFocusMessageRequest);
      window.removeEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleChatEditRequest);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelChatEditRequest);
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
      containerRef.current.style.backgroundColor = `rgb(${colorBlueLightestChannel} / ${1 - value})`;
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
    hour12: false,
  });
  const editTime = message.editedAt ? new Date(message.editedAt) : null;
  const deleteTime = message.deletedAt ? new Date(message.deletedAt) : null;

  const msgTime = formattedTime;
  const clearMessage = `${msgTime} ${intl.formatMessage(intlMessages.chatClear)}`;

  const messageContent: {
    name: string;
    color: string;
    isModerator: boolean;
    isPresentationUpload?: boolean;
    component: React.ReactNode;
    avatarIcon?: string;
    isSystemSender?: boolean;
    showAvatar: boolean;
    showHeading: boolean;
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
          showAvatar: true,
          showHeading: true,
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
          showAvatar: true,
          showHeading: true,
        };
      case ChatMessageType.CHAT_CLEAR:
        return {
          name: intl.formatMessage(intlMessages.systemLabel),
          color: '',
          isModerator: false,
          isSystemSender: true,
          component: (
            <ChatMessageNotificationContent
              iconName="delete"
              text={clearMessage}
            />
          ),
          showAvatar: false,
          showHeading: false,
        };
      case ChatMessageType.BREAKOUT_ROOM:
        return {
          name: message.senderName,
          color: '#0F70D7',
          isModerator: true,
          isSystemSender: false,
          component: (
            <ChatMessageTextContent
              emphasizedMessage
              text={message.message}
            />
          ),
          showAvatar: true,
          showHeading: true,
        };
      case ChatMessageType.API:
        return {
          name: message.senderName,
          color: '#0F70D7',
          isModerator: true,
          isSystemSender: true,
          component: (
            <ChatMessageNotificationContent
              text={message.message}
            />
          ),
          showAvatar: false,
          showHeading: false,
        };
      case ChatMessageType.USER_AWAY_STATUS_MSG: {
        const { away } = JSON.parse(message.messageMetadata);
        const awayMessage = (away)
          ? intl.formatMessage(intlMessages.userAway, { user: message.senderName })
          : intl.formatMessage(intlMessages.userNotAway, { user: message.senderName });
        return {
          name: message.senderName,
          color: '#0F70D7',
          isModerator: true,
          isSystemSender: true,
          component: (
            <ChatMessageNotificationContent
              iconName="time"
              text={awayMessage}
            />
          ),
          showAvatar: false,
          showHeading: false,
        };
      }
      case ChatMessageType.PLUGIN: {
        return {
          name: message.user?.name,
          color: message.user?.color,
          isModerator: message.user?.isModerator,
          isSystemSender: false,
          showAvatar: true,
          showHeading: true,
          component: currentPluginMessageMetadata.custom
            ? null
            : (
              <ChatMessageTextContent
                emphasizedMessage={message.chatEmphasizedText}
                text={message.message}
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
          isSystemSender: false,
          showAvatar: true,
          showHeading: true,
          component: (
            <ChatMessageTextContent
              emphasizedMessage={message.chatEmphasizedText}
              text={message.message}
            />
          ),
        };
    }
  }, [message.message]);

  const shouldRenderAvatar = messageContent.showAvatar
    && !sameSender
    && !isCustomPluginMessage;

  const shouldRenderHeader = messageContent.showHeading
    && !sameSender
    && !isCustomPluginMessage;

  return (
    <Container
      ref={containerRef}
      $sequence={message.messageSequence}
      data-sequence={message.messageSequence}
      data-focusable={!deleteTime && !messageContent.isSystemSender}
    >
      <ChatWrapper
        className={`chat-message-wrapper ${focused ? 'chat-message-wrapper-focused' : ''} ${keyboardFocused ? 'chat-message-wrapper-keyboard-focused' : ''}`}
        isSystemSender={isSystemSender}
        sameSender={sameSender}
        ref={messageRef}
        isPresentationUpload={messageContent.isPresentationUpload}
        isCustomPluginMessage={isCustomPluginMessage}
      >
        <ChatMessageToolbar
          keyboardFocused={keyboardFocused}
          hasToolbar={hasToolbar}
          locked={locked}
          deleted={!!deleteTime}
          messageId={message.messageId}
          chatId={message.chatId}
          username={message.user?.name}
          own={message.user?.userId === currentUser?.userId}
          amIModerator={Boolean(currentUser?.isModerator)}
          message={message.message}
          messageSequence={message.messageSequence}
          emphasizedMessage={message.chatEmphasizedText}
          onEmojiSelected={(emoji) => {
            sendReaction(emoji.native);
            setIsToolbarReactionPopoverOpen(false);
          }}
          onReactionPopoverOpenChange={setIsToolbarReactionPopoverOpen}
          reactionPopoverIsOpen={isToolbarReactionPopoverOpen}
          chatDeleteEnabled={CHAT_DELETE_ENABLED}
          chatEditEnabled={CHAT_EDIT_ENABLED}
          chatReactionsEnabled={CHAT_REACTIONS_ENABLED}
          chatReplyEnabled={CHAT_REPLY_ENABLED}
        />
        {(shouldRenderAvatar || shouldRenderHeader) && (
        <ChatHeading>
          {shouldRenderAvatar && (
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
          {shouldRenderHeader && (
            <ChatMessageHeader
              sameSender={message?.user ? sameSender : false}
              name={messageContent.name}
              currentlyInMeeting={message.user?.currentlyInMeeting ?? true}
              dateTime={dateTime}
              deleteTime={deleteTime}
              editTime={editTime}
            />
          )}
        </ChatHeading>
        )}
        <ChatContent
          className="chat-message-content"
          ref={messageContentRef}
          sameSender={message?.user ? sameSender : false}
          isCustomPluginMessage={isCustomPluginMessage}
          data-chat-message-id={message?.messageId}
          $highlight={hasToolbar && !deleteTime}
          $editing={editing}
          $focused={focused}
          $keyboardFocused={keyboardFocused}
          $reactionPopoverIsOpen={isToolbarReactionPopoverOpen}
        >
          {message.replyToMessage && !deleteTime && (
          <ChatMessageReplied
            message={message.replyToMessage.message}
            sequence={message.replyToMessage.messageSequence}
            emphasizedMessage={message.replyToMessage.chatEmphasizedText}
            deletedByUser={message.replyToMessage.deletedBy?.name ?? null}
          />
          )}
          {!deleteTime && (
          <MessageItemWrapper $edited={!!editTime} $sameSender={sameSender}>
            {messageContent.component}
            {messageReadFeedbackEnabled && (
            <MessageReadConfirmation
              message={message}
            />
            )}
          </MessageItemWrapper>
          )}
          {!deleteTime && editTime && sameSender && (
            <EditLabelWrapper>
              <EditLabel>
                <Icon iconName="pen_tool" />
                <span>{intl.formatMessage(intlMessages.edited)}</span>
              </EditLabel>
            </EditLabelWrapper>
          )}
          {deleteTime && (
            <DeleteMessage>
              {intl.formatMessage(intlMessages.deleteMessage, { 0: message.deletedBy?.name })}
            </DeleteMessage>
          )}
        </ChatContent>
        {!deleteTime && (
        <ChatMessageReactions
          reactions={message.reactions}
          deleteReaction={deleteReaction}
          sendReaction={sendReaction}
        />
        )}
      </ChatWrapper>
    </Container>
  );
};

function areChatMessagesEqual(prevProps: ChatMessageProps, nextProps: ChatMessageProps) {
  const prevMessage = prevProps?.message;
  const nextMessage = nextProps?.message;
  return prevMessage?.createdAt === nextMessage?.createdAt
    && prevMessage?.user?.currentlyInMeeting === nextMessage?.user?.currentlyInMeeting
    && prevMessage?.recipientHasSeen === nextMessage.recipientHasSeen
    && prevMessage?.message === nextMessage.message
    && prevMessage?.reactions?.length === nextMessage?.reactions?.length
    && prevProps.focused === nextProps.focused
    && prevProps.keyboardFocused === nextProps.keyboardFocused;
}

export default memo(ChatMesssage, areChatMessagesEqual);
