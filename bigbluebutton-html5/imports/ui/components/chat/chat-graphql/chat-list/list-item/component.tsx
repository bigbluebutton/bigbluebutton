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
import { List } from "react-virtualized";

interface ChatListItemProps {
  message: Message;
  previousMessage?: Message;
  index: number;
  listRef: Ref<List>;
  cacheClearFn: Function;
}

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
});

const ChatListItem: React.FC<ChatListItemProps> = ({ message, previousMessage, index, listRef, cacheClearFn}) => {
  const intl = useIntl();
  if (!message) return null;
  const sameSender = previousMessage?.user?.userId === message?.user?.userId;
  const dateTime = new Date(message?.createdTime);
  
  useEffect( () => {
    requestAnimationFrame(() => {
      cacheClearFn(index, 0);
      if(listRef) {
        listRef.current.forceUpdateGrid();
      }
    });
  }, []);

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
              isOnline={message.user.isOnline}
            >
              {message.user.name}
              {message.user.isOnline
                ? null
                : (
                  <ChatUserOffline>
                    {`(${intl.formatMessage(intlMessages.offline)})`}
                  </ChatUserOffline>
                )}
            </ChatUserName>
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

export default ChatListItem;
