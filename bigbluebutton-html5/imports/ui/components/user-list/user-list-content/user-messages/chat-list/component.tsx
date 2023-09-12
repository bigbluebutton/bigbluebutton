import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Styled from './styles';
import { defineMessages, useIntl } from 'react-intl';
import ChatListItem from './chat-list-item/component'
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import Service from '/imports/ui/components/user-list/service';
import { findDOMNode } from 'react-dom';

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
  const messageListRef = React.useRef<HTMLDivElement>();
  const messageItemsRef = React.useRef<HTMLDivElement>();
  const [selectedChat, setSelectedChat] = React.useState(null);
  const { roving } = Service;

  React.useEffect(() => {
    messageListRef.current?.addEventListener(
      'keydown',
      rove,
      true,
    );

    return () => {
      messageListRef.current?.removeEventListener(
        'keydown',
        rove,
        true,
      );
    };
  }, [messageListRef]);

  React.useEffect(() => {
    const firstChild = selectedChat?.firstChild;
    if (firstChild) firstChild.focus();
  }, [selectedChat]);

  const rove = (event: KeyboardEvent) => {
    const msgItemsRef = findDOMNode(messageItemsRef.current);
    roving(event, setSelectedChat, msgItemsRef, selectedChat);
    event.stopPropagation();
  }

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
        tabIndex={0}
        ref={messageListRef}
      >
        <Styled.List>
          <TransitionGroup ref={messageItemsRef}>
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
