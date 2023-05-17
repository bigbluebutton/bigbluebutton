import React, { Ref, useEffect } from "react";
import { Message } from '/imports/ui/Types/message';
import { FormattedTime, defineMessages, useIntl } from 'react-intl';
import {
  ChatAvatar,
  ChatTime,
  ChatUserContent,
  ChatUserName,
  ChatWrapper,
  ChatUserOffline,
  ChatMessage,
  ChatContent,
} from "./styles";


interface ChatMessageProps {
  message: Message;
  previousMessage?: Message;
  lastSenderPreviousPage?: string | null;
}

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
});

const ChatMesssage: React.FC<ChatMessageProps> = ({ message, previousMessage, lastSenderPreviousPage}) => {
  const intl = useIntl();
  if (!message) return null;
  const sameSender = (previousMessage?.user?.userId || lastSenderPreviousPage) === message?.user?.userId;
  const dateTime = new Date(message?.createdTime);
  return (
    <ChatWrapper
      sameSender={sameSender}
    >
      {
        sameSender ? null : (
          <ChatAvatar
              avatar={message.user.avatar}
              color={message.user.color}
              moderator={message.user.isModerator}
            >
              {message.user.name.toLowerCase().slice(0, 2) || "  "}
            </ChatAvatar>
        )
      }
      <ChatContent>
      {sameSender ? null :
        (
          <ChatUserContent>
            <ChatUserName
            >
              {message.user.name}
            </ChatUserName>
              {
                message.user.isOnline ? null : (
                  <ChatUserOffline
                  >
                    {`(${intl.formatMessage(intlMessages.offline)})`}
                  </ChatUserOffline>
                )
              }

            <ChatTime>
              <FormattedTime value={dateTime} />
            </ChatTime>
          </ChatUserContent>
        )
      }
        <ChatMessage
          sameSender={sameSender}
          emphasizedMessage={message.user.isModerator}
        >
          {message.message}
        </ChatMessage>
      </ChatContent>
    </ChatWrapper>
  );
};

export default ChatMesssage;