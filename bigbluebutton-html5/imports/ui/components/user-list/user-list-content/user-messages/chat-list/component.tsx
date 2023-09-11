import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Styled from './styles';
import { defineMessages, useIntl } from 'react-intl';
import ChatListItem from './chat-list-item/component'
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';

const intlMessages = defineMessages({
    messagesTitle: {
        id: 'app.userList.messagesTitle',
        description: 'Title for the messages list',
    },
});

interface ChatListProps {
    chats: Chat[],
}

const getActiveChats = (chats: Chat[]) => chats.map((chat) => (
  <CSSTransition
    classNames="transition"
    appear
    enter
    exit={false}
    timeout={0}
    component="div"
    key={chat.chatId}
  >
    <Styled.ListTransition>
      <ChatListItem
        chat={chat}
      />
    </Styled.ListTransition>
  </CSSTransition>
));

const ChatList: React.FC<ChatListProps> = ({ chats }) => {

    const intl = useIntl();
    return (
        <Styled.Messages>
            <Styled.Container>
                <Styled.MessagesTitle data-test="messageTitle">
                    {intl.formatMessage(intlMessages.messagesTitle)}
                </Styled.MessagesTitle>
            </Styled.Container>
            <Styled.ScrollableList
                role="tabpanel"
                tabIndex={-1}
            >
                <Styled.List>
                    <TransitionGroup >
                        {getActiveChats(chats) ?? null}
                    </TransitionGroup>
                </Styled.List>
            </Styled.ScrollableList>
        </Styled.Messages>)
};

const ChatListContainer: React.FC = () => {
  const chats = useChat((chat) => chat) as Chat[];
  return (
    <ChatList chats={chats} />
  );
};

export default ChatListContainer;

