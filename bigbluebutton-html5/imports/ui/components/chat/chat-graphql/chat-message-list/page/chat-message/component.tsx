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
import FocusTrap from 'focus-trap-react';
import classNames from 'classnames';
import { useMutation } from '@apollo/client';
import ChatMessageHeader from './message-header/component';
import ChatMessageTextContent from './message-content/text-content/component';
import ChatPollContent from './message-content/poll-content/component';
import ChatMessagePresentationContent from './message-content/presentation-content/component';
import {
  ChatWrapper,
  ChatMessageContentWrapper,
  ChatAvatar,
  MessageItemWrapper,
  Container,
  DeleteMessage,
  ChatHeading,
  EditLabel,
  ChatContentFooter,
  ChatTime,
  FlexColumn,
  PluginInformationMetadata,
} from './styles';
import {
  ChatMessageType,
  MESSAGE_HIGHLIGHT,
  ChatEvents,
  SYSTEM_MESSAGES_WITH_HEADERS,
} from '/imports/ui/core/enums/chat';
import MessageReadConfirmation from './message-read-confirmation/component';
import ChatMessageToolbar from './message-toolbar/component';
import ChatMessageReactions from './message-reactions/component';
import ChatMessageReplied from './message-replied/component';
import Icon from '/imports/ui/components/common/icon/component';
import { colorBlueLighterChannel } from '/imports/ui/stylesheets/styled-components/palette';
import ChatMessageNotificationContent from './message-content/notification-content/component';
import { getValueByPointer } from '/imports/utils/object-utils';
import Tooltip from '/imports/ui/components/common/tooltip/container';
import Auth from '/imports/ui/services/auth';
import KEYS from '/imports/utils/keys';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import logger from '/imports/startup/client/logger';
import { CHAT_DELETE_MESSAGE_MUTATION, CHAT_SET_PINNED_MUTATION } from './mutations';
import { Popover } from '@mui/material';
import { EmojiPicker, EmojiPickerWrapper } from './message-toolbar/styles';
import { isMobile } from '/imports/utils/deviceInfo';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { useModalRegistration } from '/imports/ui/core/singletons/modalController';
import useChat from '/imports/ui/core/hooks/useChat';

interface ChatMessageProps {
  message: Message;
  previousMessage: Message;
  lastSenderPreviousPage: string | null | undefined;
  setRenderedChatMessages: React.Dispatch<React.SetStateAction<MessageDetails[]>>
  scrollRef: React.RefObject<HTMLDivElement>;
  markMessageAsSeen: (message: Message) => void;
  messageReadFeedbackEnabled: boolean;
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
  focused: boolean;
  sendReaction: (reactionEmoji: string, chatId: string, messageId: string) => void;
  deleteReaction: (reactionEmoji: string, chatId: string, messageId: string) => void;
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
  pin: {
    id: 'app.chat.toolbar.pin',
    description: 'pin message label',
  },
  pinConfirmationTitle: {
    id: 'app.chat.toolbar.pin.confirmationTitle',
    description: '',
  },
  pinConfirmationQuestion: {
    id: 'app.chat.toolbar.pin.confirmationQuestion',
    description: 'Simple question to confirm pinning',
  },
  pinConfirmationDescription: {
    id: 'app.chat.toolbar.pin.confirmationDescription',
    description: '',
  },
  replacePinConfirmationTitle: {
    id: 'app.chat.toolbar.pin.replaceConfirmationTitle',
    description: 'Title for pin replacement confirmation modal',
  },
  replacePinConfirmationDescription: {
    id: 'app.chat.toolbar.pin.replaceConfirmationDescription',
    description: 'Description for pin replacement confirmation modal',
  },
  replacePinConfirmButton: {
    id: 'app.chat.toolbar.pin.replaceConfirmButton',
    description: 'Confirm button label for pin replacement modal',
  },
  unpinConfirmationTitle: {
    id: 'app.chat.pinnedMessages.confirmModal.unpinTitle',
    description: 'Title for unpin confirmation modal',
  },
  unpinConfirmationDescription: {
    id: 'app.chat.pinnedMessages.confirmModal.unpinMessage',
    description: 'Description for unpin confirmation modal',
  },
  unpinConfirmButton: {
    id: 'app.chat.pinnedMessages.confirmModal.confirm',
    description: 'Confirm button label for unpin modal',
  },
  delete: {
    id: 'app.chat.toolbar.delete',
    description: 'delete label',
  },
  cancelLabel: {
    id: 'app.chat.toolbar.delete.cancelLabel',
    description: '',
  },
  deleteConfirmationTitle: {
    id: 'app.chat.toolbar.delete.confirmationTitle',
    description: '',
  },
  deleteConfirmationDescription: {
    id: 'app.chat.toolbar.delete.confirmationDescription',
    description: '',
  },
  quizResult: {
    id: 'app.chat.quizResult',
    description: 'Quiz result label in chat',
  },
  pluginMetadataInformation: {
    id: 'app.chat.plugin.metadataInformation',
    description: 'Plugin metadata information within chat message',
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
  focused,
}, ref) => {
  const intl = useIntl();
  const chatMessageContentWrapperRef = React.useRef<HTMLDivElement>(null);
  const messageContentRef = React.useRef<HTMLDivElement>(null);
  const [isToolbarReactionPopoverOpen, setIsToolbarReactionPopoverOpen] = React.useState(false);
  const [keyboardFocused, setKeyboardFocused] = React.useState(false);
  const [isTryingToDelete, setIsTryingToDelete] = React.useState(false);
  const [isTryingToPin, setIsTryingToPin] = React.useState(false);
  const [isTryingToReplacePin, setIsTryingToReplacePin] = React.useState(false);
  const [isTryingToUnpin, setIsTryingToUnpin] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const animationInitialTimestamp = React.useRef(0);
  const animationInitialScrollPosition = React.useRef(0);
  const animationScrollPositionDiff = React.useRef(0);
  const animationInitialBgColor = React.useRef('');
  const animationScrollDirection = React.useRef<'up' | 'down'>('up');
  const onFocusTrapDeactivation = React.useRef<(() => void) | null>(null);

  const { data: chatData } = useChat(
    (chat) => ({ chatId: chat.chatId, pinnedMessageId: chat.pinnedMessageId }),
    { chatId: message.chatId, skip: !message.chatId },
  );
  const currentPinnedMessageId: string | null = useMemo(() => {
    const chat = Array.isArray(chatData) ? chatData[0] : chatData;
    return chat?.pinnedMessageId ?? null;
  }, [chatData]);

  const [chatSetPinned] = useMutation(CHAT_SET_PINNED_MUTATION);
  const pinMessageAction = useCallback(() => {
    chatSetPinned({
      variables: {
        chatId: message.chatId,
        messageId: message.messageId,
        pinned: true,
      },
    }).catch((e) => {
      logger.error({
        logCode: 'chat_set_pinned_error',
        extraInfo: {
          errorName: e?.name,
          errorMessage: e?.message,
        },
      }, `Pinning the message failed: ${e?.message}`);
    });
  }, [chatSetPinned, message.chatId, message.messageId]);

  const unpinMessageAction = useCallback(() => {
    chatSetPinned({
      variables: {
        chatId: message.chatId,
        messageId: message.messageId,
        pinned: false,
      },
    }).catch((e) => {
      logger.error({
        logCode: 'chat_set_pinned_error',
        extraInfo: {
          errorName: e?.name,
          errorMessage: e?.message,
        },
      }, `Unpinning the message failed: ${e?.message}`);
    });
  }, [chatSetPinned, message.chatId, message.messageId]);

  const [chatDeleteMessage] = useMutation(CHAT_DELETE_MESSAGE_MUTATION);
  const onDeleteConfirmation = useCallback(() => {
    chatDeleteMessage({
      variables: {
        chatId: message.chatId,
        messageId: message.messageId,
      },
    }).catch((e) => {
      logger.error({
        logCode: 'chat_delete_message_error',
        extraInfo: {
          errorName: e?.name,
          errorMessage: e?.message,
        },
      }, `Deleting the message failed: ${e?.message}`);
    });
  }, [chatDeleteMessage, message.chatId, message.messageId]);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);

  const {
    isOpen: isTryingToDeleteModalOpen,
    close: tryingToDeleteModalClose,
    open: tryingToDeleteModalOpen,
  } = useModalRegistration({
    id: 'chatMessageTryingToDeleteModal',
    priority: 'high',
  });

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
    const containerOffset = containerRef.current?.offsetTop || 0;
    const scrollTop = scrollRef.current?.scrollTop || 0;
    const viewportHeight = scrollRef.current?.offsetHeight || 0;

    // If no scroll is needed (message is already visible)
    if (containerOffset >= scrollTop && containerOffset <= scrollTop + viewportHeight) {
      requestAnimationFrame(startBackgroundAnimation);
      return;
    }

    // If scroll up is needed
    if (containerOffset < scrollTop) {
      animationScrollDirection.current = 'up';
      animationInitialScrollPosition.current = scrollTop;
      animationScrollPositionDiff.current = scrollTop - (containerOffset - (viewportHeight / 2));
      animationInitialTimestamp.current = timestamp;
      requestAnimationFrame(animateScrollPosition);
      return;
    }

    // If scroll down is needed
    if (containerOffset > scrollTop + viewportHeight) {
      animationScrollDirection.current = 'down';
      animationInitialScrollPosition.current = scrollTop;
      animationScrollPositionDiff.current = (containerOffset - (viewportHeight / 2)) - scrollTop;
      animationInitialTimestamp.current = timestamp;
      requestAnimationFrame(animateScrollPosition);
    }
  };

  const startBackgroundAnimation = (timestamp: number) => {
    animationInitialTimestamp.current = timestamp;
    animationInitialBgColor.current = containerRef.current?.style.backgroundColor ?? '';
    requestAnimationFrame(animateBackgroundColor);
  };

  const animateScrollPosition = (timestamp: number) => {
    const value = (timestamp - animationInitialTimestamp.current) / SCROLL_ANIMATION_DURATION;
    const { current: scrollContainer } = scrollRef;
    const { current: messageContainer } = containerRef;
    const { current: initialPosition } = animationInitialScrollPosition;
    const { current: diff } = animationScrollPositionDiff;
    const { current: direction } = animationScrollDirection;

    if (!scrollContainer || !messageContainer) return;

    if (value <= 1) {
      if (direction === 'up') {
        scrollContainer.scrollTop = initialPosition - (value * diff);
      } else {
        scrollContainer.scrollTop = initialPosition + (value * diff);
      }
      requestAnimationFrame(animateScrollPosition);
    } else {
      if (direction === 'up') {
        scrollContainer.scrollTop = initialPosition - diff;
      } else {
        scrollContainer.scrollTop = initialPosition + diff;
      }
      requestAnimationFrame(startBackgroundAnimation);
    }
  };

  const animateBackgroundColor = (timestamp: number) => {
    if (!chatMessageContentWrapperRef.current) return;
    const value = (timestamp - animationInitialTimestamp.current) / ANIMATION_DURATION;
    if (value < 1) {
      chatMessageContentWrapperRef.current.style.backgroundColor = `rgb(${colorBlueLighterChannel} / ${1 - value})`;
      requestAnimationFrame(animateBackgroundColor);
    } else {
      chatMessageContentWrapperRef.current.style.backgroundColor = animationInitialBgColor.current;
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
  }, [chatMessageContentWrapperRef]);

  const scrollEndFrameRef = React.useRef<number>();

  const pollScrollEndEvent = useCallback((
    setFrameId: (id: number) => void,
    {
      stabilityFrames,
      currentFrame,
    } = {
      stabilityFrames: 20,
      currentFrame: 0,
    },
  ) => {
    if (currentFrame < stabilityFrames) {
      const frameId = requestAnimationFrame(() => {
        pollScrollEndEvent(setFrameId, {
          stabilityFrames,
          currentFrame: currentFrame + 1,
        });
      });
      setFrameId(frameId);
      return;
    }

    if (messageRef.current && isInViewport(messageRef.current)) {
      markMessageAsSeen(message);
    }
  }, [markMessageAsSeen, message]);

  const startScrollEndEventPolling = useCallback(() => {
    if (scrollEndFrameRef.current != null) {
      cancelAnimationFrame(scrollEndFrameRef.current);
      scrollEndFrameRef.current = undefined;
    }
    scrollEndFrameRef.current = requestAnimationFrame(() => {
      pollScrollEndEvent((frameId) => {
        scrollEndFrameRef.current = frameId;
      });
    });
  }, []);

  useEffect(() => {
    const callbackFunction = () => {
      startScrollEndEventPolling();
    };
    if (message && scrollRef.current && messageRef.current) {
      if (isInViewport(messageRef.current)) {
        markMessageAsSeen(message);
      } else {
        scrollRef.current.addEventListener('scroll', callbackFunction);
      }
    }
    return () => {
      scrollRef?.current?.removeEventListener('scroll', callbackFunction);
      if (scrollEndFrameRef.current !== undefined) {
        cancelAnimationFrame(scrollEndFrameRef.current);
        scrollEndFrameRef.current = undefined;
      }
    };
  }, [message, messageRef, startScrollEndEventPolling, markMessageAsSeen]);

  useEffect(() => {
    if (focused) {
      containerRef.current?.scrollIntoView({ behavior: 'instant', block: 'center', inline: 'center' });
    }
  }, [focused]);

  const pluginMessageNotCustom = (previousMessage?.messageType !== ChatMessageType.PLUGIN
    || !JSON.parse(previousMessage?.messageMetadata).custom);
  let sameSender = ((previousMessage?.user?.userId
    || lastSenderPreviousPage) === message?.user?.userId) && pluginMessageNotCustom;
  // System message doesn't have a user
  const isSystemSender = message.user === null;
  const messageHighlight = MESSAGE_HIGHLIGHT.has(message.messageType as ChatMessageType);
  const messagesWithHeaders = SYSTEM_MESSAGES_WITH_HEADERS.has(message.messageType as ChatMessageType);

  const currentPluginMessageMetadata: {
    custom: boolean;
    pluginName: string;
    pluginCustomMetadata?: unknown;
  } | null = useMemo(() => {
    if (message.messageType === ChatMessageType.PLUGIN) {
      const parsedPluginData = JSON.parse(message.messageMetadata);
      const isParsedPluginDataValid = 'custom' in parsedPluginData
        && 'pluginName' in parsedPluginData;
      if (isParsedPluginDataValid) {
        return {
          custom: parsedPluginData.custom,
          pluginName: parsedPluginData?.pluginName,
          pluginCustomMetadata: parsedPluginData?.pluginName,
        };
      }
    }
    return null;
  }, [message]);
  const isCustomPluginMessage: boolean = currentPluginMessageMetadata !== null && currentPluginMessageMetadata.custom;
  const isCustomMessageFromPlugin: boolean = message.messageType === ChatMessageType.PLUGIN && isCustomPluginMessage;

  const dateTime = new Date(message?.createdAt);
  const formattedTime = intl.formatTime(dateTime, {
    hour: 'numeric',
    minute: 'numeric',
    hour12: false,
  });
  const editTime = message.editedAt ? new Date(message.editedAt) : null;
  const deleteTime = message.deletedAt ? new Date(message.deletedAt) : null;
  const isPinned = !!(message?.pinnedBy?.name);

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
      case ChatMessageType.POLL: {
        const pollData = JSON.parse(message.messageMetadata) as { quiz: boolean;};
        return {
          name: pollData.quiz
            ? intl.formatMessage(intlMessages.quizResult) : intl.formatMessage(intlMessages.pollResult),
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
      }
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
          showAvatar: false,
          showHeading: false,
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
              text={message.messageAsHtml}
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
            <ChatMessageTextContent
              text={message.messageAsHtml}
            />
          ),
          showAvatar: true,
          showHeading: true,
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
          ? `${intl.formatMessage(intlMessages.userIsPresenterSetBy, {
            presenterName: message.senderName,
            assignedByName: assignedBy,
          })}`
          : `${intl.formatMessage(intlMessages.userIsPresenter, { presenterName: message.senderName })}`;
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
          component: isCustomPluginMessage
            ? null
            : (
              <ChatMessageTextContent
                text={message.messageAsHtml}
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
              text={message.messageAsHtml}
            />
          ),
        };
    }
  }, [message.message, intl.locale]);

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

  const deactivateFocusTrap = useCallback(() => {
    setKeyboardFocused(false);
  }, []);

  const {
    user,
    message: messageText,
    messageAsHtml,
    messageId,
    chatId,
    chatEmphasizedText,
    messageSequence,
  } = message;

  const onReply = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();

    const handler = () => {
      window.dispatchEvent(
        new CustomEvent(ChatEvents.CHAT_REPLY_INTENTION, {
          detail: {
            username: user?.name,
            message: messageAsHtml,
            messageId,
            chatId,
            emphasizedMessage: chatEmphasizedText,
            sequence: messageSequence,
          },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(ChatEvents.CHAT_CANCEL_EDIT_REQUEST),
      );
    };

    if (keyboardFocused) {
      onFocusTrapDeactivation.current = handler;
      deactivateFocusTrap();
    } else {
      handler();
    }
  }, [
    user?.name,
    messageAsHtml,
    messageId,
    chatId,
    chatEmphasizedText,
    messageSequence,
    deactivateFocusTrap,
    keyboardFocused,
  ]);

  const onEdit = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();

    const handler = () => {
      window.dispatchEvent(
        new CustomEvent(ChatEvents.CHAT_EDIT_REQUEST, {
          detail: {
            messageId,
            chatId,
            message: messageText,
          },
        }),
      );
      window.dispatchEvent(
        new CustomEvent(ChatEvents.CHAT_CANCEL_REPLY_INTENTION),
      );
    };

    if (keyboardFocused) {
      onFocusTrapDeactivation.current = handler;
      deactivateFocusTrap();
    } else {
      handler();
    }
  }, [messageId, chatId, message, deactivateFocusTrap, keyboardFocused]);

  const togglePin = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    if (isPinned) {
      const handler = () => {
        setIsTryingToUnpin(true);
      };

      if (keyboardFocused) {
        onFocusTrapDeactivation.current = handler;
        deactivateFocusTrap();
      } else {
        handler();
      }
      return;
    }

    const otherPinnedIds = currentPinnedMessageId && currentPinnedMessageId !== message.messageId;
    const hasOtherPinned = !!otherPinnedIds;

    const handler = () => {
      if (hasOtherPinned) {
        setIsTryingToReplacePin(true);
      } else {
        setIsTryingToPin(true);
      }
    };

    if (keyboardFocused) {
      onFocusTrapDeactivation.current = handler;
      deactivateFocusTrap();
    } else {
      handler();
    }
  }, [deactivateFocusTrap, keyboardFocused, isPinned, message.message, currentPinnedMessageId]);

  const onDelete = useCallback((e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();

    const handler = () => {
      setIsTryingToDelete(true);
      tryingToDeleteModalOpen();
    };

    if (keyboardFocused) {
      onFocusTrapDeactivation.current = handler;
      deactivateFocusTrap();
    } else {
      handler();
    }
  }, [deactivateFocusTrap, keyboardFocused]);

  const onEmojiSelected = useCallback((emoji: { native: string }) => {
    sendReaction(emoji.native, message.chatId, message.messageId);
    setIsToolbarReactionPopoverOpen(false);
    deactivateFocusTrap();
  }, [message.chatId, message.messageId, sendReaction]);

  if (!message) return null;

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

  const showPluginMetadataFooter = !deleteTime && isCustomMessageFromPlugin && currentUserIsModerator;

  const contentElement = (
    <ChatMessageContentWrapper
      className="chat-message-content"
      ref={chatMessageContentWrapperRef}
      sameSender={message?.user ? sameSender : false}
      isCustomPluginMessage={isCustomPluginMessage}
      $isSystemSender={isSystemSender}
      data-chat-message-id={message?.messageId}
      $highlight={hasToolbar && messageContent.showToolbar && !deleteTime}
      $editing={editing}
      $keyboardFocused={keyboardFocused}
      $reactionPopoverIsOpen={isToolbarReactionPopoverOpen}
      $emphasizedMessage={message.chatEmphasizedText}
      role="listitem"
    >
      <ChatMessageToolbar
        isCustomPluginMessage={isCustomPluginMessage}
        hasToolbar={hasToolbar && messageContent.showToolbar}
        locked={locked}
        deleted={!!deleteTime}
        isPinned={isPinned}
        own={message.user?.userId === currentUserId}
        amIModerator={currentUserIsModerator}
        isBreakoutRoom={isBreakoutRoom}
        messageSequence={message.messageSequence}
        onReactionPopoverOpenChange={setIsToolbarReactionPopoverOpen}
        reactionPopoverIsOpen={isToolbarReactionPopoverOpen}
        chatDeleteEnabled={chatDeleteEnabled}
        chatEditEnabled={chatEditEnabled}
        chatReactionsEnabled={chatReactionsEnabled}
        chatReplyEnabled={chatReplyEnabled}
        onDelete={onDelete}
        onEdit={onEdit}
        onReply={onReply}
        togglePin={togglePin}
        isPublicChat={isPublicChat}
      />
      {message.replyToMessage && !deleteTime && (
        <ChatMessageReplied
          message={message.replyToMessage.messageAsHtml || ''}
          sequence={message.replyToMessage.messageSequence}
          deletedByUser={message.replyToMessage.deletedBy?.name ?? null}
        />
      )}
      {!deleteTime && (
        <MessageItemWrapper
          data-chat-message-id={message?.messageId}
          ref={messageContentRef}
        >
          {messageContent.component}
          {messageReadFeedbackEnabled && (
            <MessageReadConfirmation
              message={message}
            />
          )}
        </MessageItemWrapper>
      )}
      {
        (showPluginMetadataFooter) && (
          <PluginInformationMetadata>
            {intl.formatMessage(intlMessages.pluginMetadataInformation, {
              userName: message.user.name,
              pluginName: currentPluginMessageMetadata?.pluginName,
            })}
            {' '}
            &nbsp;
            <FormattedTime value={dateTime} hour12={false} />
          </PluginInformationMetadata>
        )
      }
      {((sameSender || (isSystemSender && !messagesWithHeaders)) && !isCustomMessageFromPlugin) && (
        <ChatContentFooter>
          {!deleteTime && editTime && (
            <Tooltip title={intl.formatTime(editTime, { hour12: false })}>
              <EditLabel>
                <Icon iconName="pen_tool" />
                <span>{intl.formatMessage(intlMessages.edited)}</span>
              </EditLabel>
            </Tooltip>
          )}
          <ChatTime>
            <FormattedTime value={dateTime} hour12={false} />
          </ChatTime>
        </ChatContentFooter>
      )}
      {deleteTime && (
        <DeleteMessage>
          {intl.formatMessage(intlMessages.deleteMessage, { userName: message.deletedBy?.name })}
        </DeleteMessage>
      )}
    </ChatMessageContentWrapper>
  );

  const reactionsElement = !deleteTime && (
    <ChatMessageReactions
      reactions={message.reactions}
      deleteReaction={deleteReaction}
      sendReaction={sendReaction}
      chatId={message.chatId}
      messageId={message.messageId}
      keyboardFocused={keyboardFocused}
    />
  );

  const reactionsPopover = (
    <Popover
      open={isToolbarReactionPopoverOpen}
      anchorEl={containerRef.current}
      onClose={() => {
        setIsToolbarReactionPopoverOpen(false);
      }}
      anchorOrigin={{
        vertical: 'top',
        horizontal: isRTL || isMobile ? 'left' : 'right',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: isRTL ? 'right' : 'left',
      }}
    >
      <EmojiPickerWrapper>
        <EmojiPicker
          onEmojiSelect={(emojiObject: { id: string; native: string }) => {
            deactivateFocusTrap();
            onEmojiSelected(emojiObject);
          }}
          showPreview={false}
          showSkinTones={false}
        />
      </EmojiPickerWrapper>
    </Popover>
  );

  const focusable = !deleteTime
    && (!messageContent.isSystemSender || message.messageType === ChatMessageType.POLL)
    && !isCustomPluginMessage;

  return (
    <Container
      data-test="chatMessageItem"
      className={classNames('chat-message-container', {
        'chat-message-container-keyboard-focused': keyboardFocused,
      })}
      ref={containerRef}
      $sequence={message.messageSequence}
      data-sequence={message.messageSequence}
      data-message-type={message.messageType}
      data-focusable={focusable}
      onKeyDown={(e) => {
        const isTargetElement = e.target === e.currentTarget;
        if (e.key === KEYS.TAB && isTargetElement) {
          setKeyboardFocused(true);
        }
      }}
      tabIndex={focusable ? -1 : undefined}
    >
      <ChatWrapper
        messageHighlight={messageHighlight}
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
                you={message.user?.userId === Auth.userID}
              >
                {/* @ts-ignore */}
                {typeof avatarDisplay === 'string' ? <span>{avatarDisplay}</span> : avatarDisplay}
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
                role="listitem"
              />
            )}
          </ChatHeading>
        )}
        {
          isToolbarReactionPopoverOpen && reactionsPopover
        }
        {keyboardFocused ? (
          <FocusTrap
            paused={isToolbarReactionPopoverOpen}
            focusTrapOptions={{
              returnFocusOnDeactivate: false,
              clickOutsideDeactivates: true,
              onDeactivate() {
                setKeyboardFocused(false);
                containerRef.current?.focus?.();
                onFocusTrapDeactivation.current?.();
                onFocusTrapDeactivation.current = null;
              },
            }}
          >
            <FlexColumn>
              {contentElement}
              {reactionsElement}
            </FlexColumn>
          </FocusTrap>
        ) : (
          <>
            {contentElement}
            {reactionsElement}
          </>
        )}
      </ChatWrapper>
      {isTryingToPin && (
        <ConfirmationModal
          isOpen={isTryingToPin}
          setIsOpen={setIsTryingToPin}
          onConfirm={pinMessageAction}
          title={intl.formatMessage(intlMessages.pinConfirmationTitle)}
          description={intl.formatMessage(intlMessages.pinConfirmationQuestion)}
          confirmButtonLabel={intl.formatMessage(intlMessages.pin)}
          cancelButtonLabel={intl.formatMessage(intlMessages.cancelLabel)}
          intl={intl}
        />
      )}
      {isTryingToReplacePin && (
        <ConfirmationModal
          isOpen={isTryingToReplacePin}
          setIsOpen={setIsTryingToReplacePin}
          onConfirm={pinMessageAction}
          title={intl.formatMessage(intlMessages.replacePinConfirmationTitle)}
          description={intl.formatMessage(intlMessages.replacePinConfirmationDescription)}
          confirmButtonLabel={intl.formatMessage(intlMessages.replacePinConfirmButton)}
          cancelButtonLabel={intl.formatMessage(intlMessages.cancelLabel)}
          intl={intl}
        />
      )}
      {isTryingToDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isTryingToDelete}
          setIsOpen={(value: boolean) => {
            setIsTryingToDelete(value);
            if (value) {
              tryingToDeleteModalOpen();
            } else {
              tryingToDeleteModalClose();
            }
          }}
          onRequestClose={() => {
            setIsTryingToDelete(false);
            tryingToDeleteModalClose();
          }}
          onConfirm={onDeleteConfirmation}
          title={intl.formatMessage(intlMessages.deleteConfirmationTitle)}
          confirmButtonLabel={intl.formatMessage(intlMessages.delete)}
          cancelButtonLabel={intl.formatMessage(intlMessages.cancelLabel)}
          description={intl.formatMessage(intlMessages.deleteConfirmationDescription)}
          confirmButtonColor="danger"
          priority="high"
          confirmButtonDataTest="confirmDeleteChatMessageButton"
          intl={intl}
        />
      )}
      {isTryingToUnpin && (
        <ConfirmationModal
          isOpen={isTryingToUnpin}
          setIsOpen={setIsTryingToUnpin}
          onConfirm={unpinMessageAction}
          title={intl.formatMessage(intlMessages.unpinConfirmationTitle)}
          description={intl.formatMessage(intlMessages.unpinConfirmationDescription)}
          confirmButtonLabel={intl.formatMessage(intlMessages.unpinConfirmButton)}
          cancelButtonLabel={intl.formatMessage(intlMessages.cancelLabel)}
          intl={intl}
        />
      )}
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
  'focused',
  'message.createdAt',
  'message.message',
  'message.recipientHasSeen',
  'message.user.currentlyInMeeting',
  'message.reactions.length',
  'message.replyToMessage.message',
  'message.pinnedBy',
] as const;

function areChatMessagesEqual(prevProps: ChatMessageProps, nextProps: ChatMessageProps) {
  return propsToCompare.every((pointer) => {
    const previousValue = getValueByPointer(prevProps, pointer);
    const nextValue = getValueByPointer(nextProps, pointer);
    return previousValue === nextValue;
  });
}

export default memo(ChatMessage, areChatMessagesEqual);
