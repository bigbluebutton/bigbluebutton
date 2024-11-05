import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import ChatListItem from './chat-list-item/component';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import deviceInfo from '/imports/utils/deviceInfo';
import roveBuilder from '/imports/ui/core/utils/keyboardRove';

const intlMessages = defineMessages({
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },
});

interface ChatListProps {
  chat: Chat,
}

const ChatList: React.FC<ChatListProps> = ({ chat }) => {
  const intl = useIntl();
  return (
    <Styled.Messages>
      <Styled.Container>
        <Styled.MessagesTitle data-test="messageTitle">
          {intl.formatMessage(intlMessages.messagesTitle)}
        </Styled.MessagesTitle>
      </Styled.Container>
      <ChatListItem chat={chat} />
    </Styled.Messages>
  );
};

const ChatListContainer: React.FC = () => {
  const { data: chats } = useChat((chat) => chat) as GraphqlDataHookSubscriptionResponse<Chat[]>;
  const publicChat = chats?.find((chat) => chat.public);

  if (publicChat) {
    return <ChatList chat={publicChat} />;
  }
  return <></>;
};

export default ChatListContainer;
