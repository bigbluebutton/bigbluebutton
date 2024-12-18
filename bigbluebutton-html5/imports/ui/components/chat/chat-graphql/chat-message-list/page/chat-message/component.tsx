import React, {
  memo,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
} from 'react';
import { MessageDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/dom-element-manipulation/chat/message/types';
import { Message } from '/imports/ui/Types/message';
import { defineMessages, FormattedTime, useIntl } from 'react-intl';
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
  ChatContentFooter,
  ChatTime,
} from './styles';
import { ChatMessageType } from '/imports/ui/core/enums/chat';
import MessageReadConfirmation from './message-read-confirmation/component';
import ChatMessageToolbar from './message-toolbar/component';
import ChatMessageReactions from './message-reactions/component';
import ChatMessageReplied from './message-replied/component';
import Icon from '/imports/ui/components/common/icon/component';
import { colorBlueLighterChannel } from '/imports/ui/stylesheets/styled-components/palette';
import ChatMessageNotificationContent from './message-content/notification-content/component';
import { getValueByPointer } from '/imports/utils/object-utils';

interface ChatMessageProps {
  message: Message;
  previousMessage: Message;
  lastSenderPreviousPage: string | null | undefined;
  setRenderedChatMessages: React.Dispatch<React.SetStateAction<MessageDetails[]>>
  scrollRef: React.RefObject<HTMLDivElement>;
  markMessageAsSeen: (message: Message) => void;
  messageReadFeedbackEnabled: boolean;
  focused: boolean;
  keyboardFocused: boolean;
  editing: boolean;
  meetingDisablePublicChat: boolean;
  meetingDisablePrivateChat: boolean;
  currentUserIsModerator: boolean;
  currentUserIsLocked: boolean;
  currentUserId: string;
  currentUserDisablePublicChat: boolean;
  isBreakoutRoom: boolean;
  isPublicChat: boolean;
  hasToolbar: boolean;
  chatReplyEnabled: boolean;
  chatDeleteEnabled: boolean;
  chatEditEnabled: boolean;
  chatReactionsEnabled: boolean;
  sendReaction: (reactionEmoji: string, reactionEmojiId: string, chatId: string, messageId: string) => void;
  deleteReaction: (reactionEmoji: string, reactionEmojiId: string, chatId: string, messageId: string) => void;
}

export interface ChatMessageRef {
  requestFocus: () => void;
  sequence: number;
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
  userIsPresenter: {
    id: 'app.chat.isPresenter',
    description: 'message when user is set presenter',
  },
  userIsPresenterSetBy: {
    id: 'app.chat.isPresenterSetBy',
    description: 'message when user is set presenter by someone else',
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

const ANIMATION_DURATION = 1000;
const SCROLL_ANIMATION_DURATION = 500;

const ChatMessage = React.forwardRef<ChatMessageRef, ChatMessageProps>(({
  previousMessage,
  lastSenderPreviousPage,
  scrollRef,
  message,
  setRenderedChatMessages,
  markMessageAsSeen,
  messageReadFeedbackEnabled,
  focused,
  keyboardFocused,
  editing,
  meetingDisablePrivateChat,
  meetingDisablePublicChat,
  currentUserDisablePublicChat,
  currentUserId,
  currentUserIsLocked,
  currentUserIsModerator,
  isBreakoutRoom,
  isPublicChat,
  hasToolbar,
  chatDeleteEnabled,
  chatEditEnabled,
  chatReactionsEnabled,
  chatReplyEnabled,
  deleteReaction,
  sendReaction,
}, ref) => {
  const intl = useIntl();
  const markMessageAsSeenOnScrollEnd = useCallback(() => {
    if (messageRef.current && isInViewport(messageRef.current)) {
      markMessageAsSeen(message);
    }
  }, [message, messageRef]);
  const messageContentRef = React.useRef<HTMLDivElement>(null);
  const [isToolbarReactionPopoverOpen, setIsToolbarReactionPopoverOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const animationInitialTimestamp = React.useRef(0);
  const animationInitialScrollPosition = React.useRef(0);
  const animationScrollPositionDiff = React.useRef(0);

  const disablePublicChat = meetingDisablePublicChat || currentUserDisablePublicChat;

  let locked = false;

  if (!currentUserIsModerator) {
    if (isPublicChat) {
      locked = currentUserIsLocked && disablePublicChat;
    } else {
      locked = currentUserIsLocked && meetingDisablePrivateChat;
    }
  }

  useImperativeHandle(ref, () => ({
    requestFocus() {
      setTimeout(() => {
        requestAnimationFrame(startScrollAnimation);
      }, 0);
    },
    sequence: message.messageSequence,
  }), [message.messageSequence]);

  const startScrollAnimation = (timestamp: number) => {
    if ((containerRef.current?.offsetTop || 0) > (scrollRef.current?.scrollTop || 0)) {
      requestAnimationFrame(startBackgroundAnimation);
      return;
    }
    animationInitialScrollPosition.current = scrollRef.current?.scrollTop || 0;
    animationScrollPositionDiff.current = (scrollRef.current?.scrollTop || 0)
      - ((containerRef.current?.offsetTop || 0) - ((scrollRef.current?.offsetHeight || 0) / 2));
    animationInitialTimestamp.current = timestamp;
    requestAnimationFrame(animateScrollPosition);
  };

  const startBackgroundAnimation = (timestamp: number) => {
    animationInitialTimestamp.current = timestamp;
    requestAnimationFrame(animateBackgroundColor);
  };

  const animateScrollPosition = (timestamp: number) => {
    const value = (timestamp - animationInitialTimestamp.current) / SCROLL_ANIMATION_DURATION;
    const { current: scrollContainer } = scrollRef;
    const { current: messageContainer } = containerRef;
    const { current: initialPosition } = animationInitialScrollPosition;
    const { current: diff } = animationScrollPositionDiff;
    if (!scrollContainer || !messageContainer) return;
    if (value <= 1) {
      // eslint-disable-next-line no-param-reassign
      scrollContainer.scrollTop = initialPosition - (value * diff);
      requestAnimationFrame(animateScrollPosition);
    } else {
      requestAnimationFrame(startBackgroundAnimation);
    }
  };

  const animateBackgroundColor = (timestamp: number) => {
    if (!messageContentRef.current) return;
    const value = (timestamp - animationInitialTimestamp.current) / ANIMATION_DURATION;
    if (value < 1) {
      messageContentRef.current.style.backgroundColor = `rgb(${colorBlueLighterChannel} / ${1 - value})`;
      requestAnimationFrame(animateBackgroundColor);
    } else {
      messageContentRef.current.style.backgroundColor = '#f4f6fa';
    }
  };

  useEffect(() => {
    setRenderedChatMessages((messages) => {
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
  let sameSender = ((previousMessage?.user?.userId
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
    isSystemSender: boolean;
    showAvatar: boolean;
    showHeading: boolean;
    showToolbar: boolean;
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
          showToolbar: false,
          isSystemSender: true,
        };
      case ChatMessageType.PRESENTATION:
        return {
          name: '',
          color: '#0F70D7',
          isModerator: false,
          isPresentationUpload: true,
          isSystemSender: true,
          component: (
            <ChatMessagePresentationContent
              metadata={message.messageMetadata}
            />
          ),
          avatarIcon: 'icon-bbb-download',
          showAvatar: true,
          showHeading: true,
          showToolbar: false,
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
          showToolbar: false,
        };
      case ChatMessageType.BREAKOUT_ROOM:
        return {
          name: message.senderName,
          color: '#0F70D7',
          isModerator: true,
          isSystemSender: true,
          component: (
            <ChatMessageTextContent
              emphasizedMessage
              text={message.message}
            />
          ),
          showAvatar: true,
          showHeading: true,
          showToolbar: true,
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
          showToolbar: false,
        };
      case ChatMessageType.USER_AWAY_STATUS_MSG: {
        const { away } = JSON.parse(message.messageMetadata);
        const awayMessage = (away)
          ? `${message.senderName} ${intl.formatMessage(intlMessages.userAway)}`
          : `${message.senderName} ${intl.formatMessage(intlMessages.userNotAway)}`;
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
          showToolbar: false,
        };
      }
      case ChatMessageType.USER_IS_PRESENTER_MSG: {
        const { assignedBy } = JSON.parse(message.messageMetadata);
        const userIsPresenterMsg = (assignedBy)
          ? `${intl.formatMessage(intlMessages.userIsPresenterSetBy, { 0: message.senderName, 1: assignedBy })}`
          : `${intl.formatMessage(intlMessages.userIsPresenter, { 0: message.senderName })}`;
        return {
          name: message.senderName,
          color: '#0F70D7',
          isModerator: true,
          isSystemSender: true,
          component: (
            <ChatMessageNotificationContent
              iconName="presentation"
              text={userIsPresenterMsg}
            />
          ),
          showAvatar: false,
          showHeading: false,
          showToolbar: false,
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
          showToolbar: true,
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
          showToolbar: true,
          component: (
            <ChatMessageTextContent
              emphasizedMessage={message.chatEmphasizedText}
              text={message.message}
            />
          ),
        };
    }
  }, [message.message]);

  sameSender = message.messageType === ChatMessageType.BREAKOUT_ROOM
    ? false
    : ((previousMessage?.user?.userId
      || lastSenderPreviousPage) === message?.user?.userId) && pluginMessageNotCustom;

  const shouldRenderAvatar = messageContent.showAvatar
    && !sameSender
    && !isCustomPluginMessage;

  const shouldRenderHeader = messageContent.showHeading
    && !sameSender
    && !isCustomPluginMessage;

  const onEmojiSelected = useCallback((emoji: { id: string; native: string }) => {
    sendReaction(emoji.native, emoji.id, message.chatId, message.messageId);
    setIsToolbarReactionPopoverOpen(false);
  }, [message.chatId, message.messageId, sendReaction]);

  let avatarDisplay;

  if (!messageContent.avatarIcon) {
    if (!message.user || message.user?.avatar.length === 0) {
      avatarDisplay = messageContent.name.toLowerCase().slice(0, 2);
    } else {
      avatarDisplay = '';
    }
  } else {
    avatarDisplay = <i className={messageContent.avatarIcon} />;
  }

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
        {(shouldRenderAvatar || shouldRenderHeader) && (
          <ChatHeading>
            {shouldRenderAvatar && (
              <ChatAvatar
                avatar={message.user?.avatar || ''}
                color={messageContent.color}
                moderator={messageContent.isModerator}
              >
                {avatarDisplay}
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
          $isSystemSender={messageContent.isSystemSender}
          data-chat-message-id={message?.messageId}
          $highlight={hasToolbar && messageContent.showToolbar && !deleteTime}
          $editing={editing}
          $focused={focused}
          $keyboardFocused={keyboardFocused}
          $reactionPopoverIsOpen={isToolbarReactionPopoverOpen}
        >
          <ChatMessageToolbar
            keyboardFocused={keyboardFocused}
            hasToolbar={hasToolbar && messageContent.showToolbar}
            locked={locked}
            deleted={!!deleteTime}
            messageId={message.messageId}
            chatId={message.chatId}
            username={message.user?.name}
            own={message.user?.userId === currentUserId}
            amIModerator={currentUserIsModerator}
            isBreakoutRoom={isBreakoutRoom}
            message={message.message}
            messageSequence={message.messageSequence}
            emphasizedMessage={message.chatEmphasizedText}
            onEmojiSelected={onEmojiSelected}
            onReactionPopoverOpenChange={setIsToolbarReactionPopoverOpen}
            reactionPopoverIsOpen={isToolbarReactionPopoverOpen}
            chatDeleteEnabled={chatDeleteEnabled}
            chatEditEnabled={chatEditEnabled}
            chatReactionsEnabled={chatReactionsEnabled}
            chatReplyEnabled={chatReplyEnabled}
          />
          {message.replyToMessage && !deleteTime && (
          <ChatMessageReplied
            message={message.replyToMessage.message || ''}
            sequence={message.replyToMessage.messageSequence}
            emphasizedMessage={message.replyToMessage.chatEmphasizedText}
            deletedByUser={message.replyToMessage.deletedBy?.name ?? null}
          />
          )}
          {!deleteTime && (
          <MessageItemWrapper>
            {messageContent.component}
            {messageReadFeedbackEnabled && (
            <MessageReadConfirmation
              message={message}
            />
            )}
          </MessageItemWrapper>
          )}
          {sameSender && (
            <ChatContentFooter>
              {!deleteTime && editTime && (
                <EditLabel>
                  <Icon iconName="pen_tool" />
                  <span>{intl.formatMessage(intlMessages.edited)}</span>
                </EditLabel>
              )}
              <ChatTime>
                <FormattedTime value={dateTime} hour12={false} />
              </ChatTime>
            </ChatContentFooter>
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
          chatId={message.chatId}
          messageId={message.messageId}
        />
        )}
      </ChatWrapper>
    </Container>
  );
});

const propsToCompare = [
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
  'focused',
  'editing',
  'keyboardFocused',
  'message.createdAt',
  'message.message',
  'message.recipientHasSeen',
  'message.user.currentlyInMeeting',
  'message.reactions.length',
  'message.replyToMessage.message',
] as const;

function areChatMessagesEqual(prevProps: ChatMessageProps, nextProps: ChatMessageProps) {
  return propsToCompare.every((pointer) => {
    const previousValue = getValueByPointer(prevProps, pointer);
    const nextValue = getValueByPointer(nextProps, pointer);
    return previousValue === nextValue;
  });
}

export default memo(ChatMessage, areChatMessagesEqual);
