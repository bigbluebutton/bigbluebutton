import React, { Ref, useCallback, useEffect, useMemo, useRef } from "react";
import { Message } from '/imports/ui/Types/message';
import {
  ChatWrapper,
  ChatContent,
} from "./styles";
import ChatMessageHeader from "./message-header/component";
import ChatMessageTextContent from "./message-content/text-content/component";
import ChatPollContent from "./message-content/poll-content/component";
import ChatMessagePresentationContent from "./message-content/presentation-content/component";
import { defineMessages, useIntl } from "react-intl";


interface ChatMessageProps {
  message: Message;
  previousMessage?: Message;
  lastSenderPreviousPage?: string | null;
  scrollRef: React.RefObject<HTMLDivElement>;
  markMessageAsSeen: Function;
}

const enum MessageType {
  TEXT = 'default',
  POLL = 'poll',
  PRESENTATION = 'presentation',
  CHAT_CLEAR = 'publicChatHistoryCleared'
}

const intlMessages = defineMessages({
  pollResult: {
    id: 'app.chat.pollResult',
    description: 'used in place of user name who published poll to chat',
  },
  presentationLabel: {
    id: 'app.presentationUploder.title',
    description: 'presentation area element label',
  },
  systemLabel: {
    id: 'app.toast.chat.system',
    description: 'presentation area element label',
  },
  chatClear: {
    id: 'app.chat.clearPublicChatMessage',
    description: 'message of when clear the public chat',
  },
});

function isInViewport(el: HTMLDivElement) {
  const rect = el.getBoundingClientRect();

  return (
    rect.top <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.bottom >= 0
  );
}

const ChatMesssage: React.FC<ChatMessageProps> = ({
  message,
  previousMessage,
  lastSenderPreviousPage,
  scrollRef,
  markMessageAsSeen,
}) => {
  const intl = useIntl();
  const messageRef = useRef<HTMLDivElement>(null);
  const markMessageAsSeenOnScrollEnd = useCallback((message, messageRef) => {
    if (messageRef.current && isInViewport(messageRef.current)) {
      markMessageAsSeen(message);
    }
  }, []);

  useEffect(() => {
    // I use a function here to remove the event listener using the same reference 
    const callbackFunction = () => {
      markMessageAsSeenOnScrollEnd(message, messageRef);
    }
    if (message && scrollRef.current && messageRef.current) {
      if (isInViewport(messageRef.current)) {
        markMessageAsSeen(message);
      } else {
        scrollRef.current.addEventListener('scrollend', callbackFunction);
      }
    }
    return () => {
      scrollRef?.current
        ?.removeEventListener('scrollend', callbackFunction);
    }
  }, [message, messageRef]);

  if (!message) return null;

  const sameSender = (previousMessage?.user?.userId || lastSenderPreviousPage) === message?.user?.userId;
  const dateTime = new Date(message?.createdTime);
  const messageContent: {
    name: string,
    color: string,
    isModerator: boolean,
    component: React.ReactElement,
  } = useMemo(() => {
    switch (message.messageType) {
      case MessageType.POLL:
        return {
          name: intl.formatMessage(intlMessages.pollResult),
          color: '#3B48A9',
          isModerator: true,
          component: (
            <ChatPollContent metadata={message.messageMetadata} />
          ),
        };
      case MessageType.PRESENTATION:
        return {
          name: intl.formatMessage(intlMessages.presentationLabel),
          color: '#0F70D7',
          isModerator: true,
          component: (
            <ChatMessagePresentationContent metadata={message.messageMetadata} />
          ),
        };
      case MessageType.CHAT_CLEAR:
        return {
          name: intl.formatMessage(intlMessages.systemLabel),
          color: '#0F70D7',
          isModerator: true,
          component: (
            <ChatMessageTextContent
              emphasizedMessage={true}
              text={intl.formatMessage(intlMessages.chatClear)}
            />
          ),
        };
      case MessageType.TEXT:
      default:
        return {
          name: message.user?.name,
          color: message.user?.color,
          isModerator: message.user?.isModerator,
          component: (
            <ChatMessageTextContent
              emphasizedMessage={message?.user?.isModerator}
              text={message.message}
            />
          ),
        }
    }
  }, []);
  return (
    <ChatWrapper
      sameSender={sameSender}
      ref={messageRef}
    >
      <ChatMessageHeader
        sameSender={message?.user ? sameSender : false}
        name={messageContent.name}
        color={messageContent.color}
        isModerator={messageContent.isModerator}
        isOnline={message.user?.isOnline ?? true}
        avatar={message.user?.avatar}
        dateTime={dateTime}
      />
      <ChatContent>
        {
          messageContent.component
        }
      </ChatContent>
    </ChatWrapper>
  );
};

export default ChatMesssage;
