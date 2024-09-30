import React, { useCallback, useEffect, useMemo } from 'react';
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
} from './styles';
import { ChatMessageType } from '/imports/ui/core/enums/chat';
import MessageReadConfirmation from './message-read-confirmation/component';

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

const ChatMesssage: React.FC<ChatMessageProps> = ({
  previousMessage,
  lastSenderPreviousPage,
  scrollRef,
  message,
  setMessagesRequestedFromPlugin,
  markMessageAsSeen,
  messageReadFeedbackEnabled,
}) => {
  const intl = useIntl();
  const markMessageAsSeenOnScrollEnd = useCallback(() => {
    if (messageRef.current && isInViewport(messageRef.current)) {
      markMessageAsSeen(message);
    }
  }, [message, messageRef]);
  const messageContentRef = React.createRef<HTMLDivElement>();

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
    <ChatWrapper
      isSystemSender={isSystemSender}
      sameSender={sameSender}
      ref={messageRef}
      isPresentationUpload={messageContent.isPresentationUpload}
      isCustomPluginMessage={isCustomPluginMessage}
    >
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
  );
};

export default ChatMesssage;
