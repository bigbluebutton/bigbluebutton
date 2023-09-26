import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { defineMessages, useIntl } from 'react-intl';
import { findDOMNode } from 'react-dom';
import Styled from './styles';
import ChatListItem from './chat-list-item/component';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import Service from '/imports/ui/components/user-list/service';

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
  const messageListRef = React.useRef<HTMLDivElement | null >(null);
  const messageItemsRef = React.useRef<HTMLDivElement | null >(null);
  const [selectedChat, setSelectedChat] = React.useState<HTMLElement>();
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
    const firstChild = (selectedChat as HTMLElement)?.firstChild;
    if (firstChild && firstChild instanceof HTMLElement) firstChild.focus();
  }, [selectedChat]);

  const rove = (event: KeyboardEvent) => {
    // eslint-disable-next-line react/no-find-dom-node
    const msgItemsRef = findDOMNode(messageItemsRef.current);
    const msgItemsRefChild = msgItemsRef?.firstChild;
    roving(event, setSelectedChat, msgItemsRefChild, selectedChat);
    event.stopPropagation();
  };

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
        <Styled.List ref={messageItemsRef}>
          <TransitionGroup>
            {getActiveChats(chats) ?? null}
          </TransitionGroup>
        </Styled.List>
      </Styled.ScrollableList>
    </Styled.Messages>
  );
};

const ChatListContainer: React.FC = () => {
  const chats = useChat((chat) => chat) as Chat[];
  return (
    <ChatList chats={chats} />
  );
};

export default ChatListContainer;
