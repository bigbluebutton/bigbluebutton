import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import Styled from './styles';
import PrivateChatListItem from './chat-list-item/component';
import { Chat as Chat } from '/imports/ui/Types/chat';
import Service from '/imports/ui/components/user-list/service';

interface ChatListProps {
  chats: Partial<Chat>[],
  privateChatSelectedCallback: () => void;
}

const getActiveChats = (
  chats: Partial<Chat>[],
  chatNodeRef: React.Ref<HTMLButtonElement>,
  privateChatSelectedCallback: () => void,
) => chats.map((chat, idx) => (
  <CSSTransition
    classNames="transition"
    appear
    enter
    exit={false}
    timeout={0}
    key={chat.chatId}
    nodeRef={chatNodeRef}
  >
    <Styled.ListTransition>
      <PrivateChatListItem
        chat={chat}
        chatNodeRef={chatNodeRef}
        index={idx}
        privateChatSelectedCallback={privateChatSelectedCallback}
      />
    </Styled.ListTransition>
  </CSSTransition>
));

const PrivateChatList: React.FC<ChatListProps> = ({ chats, privateChatSelectedCallback }) => {
  const messageListRef = React.useRef<HTMLDivElement | null>(null);
  const messageItemsRef = React.useRef<HTMLDivElement | null>(null);
  const [selectedChat, setSelectedChat] = React.useState<HTMLElement>();
  const { roving } = Service;
  const chatNodeRef = React.useRef<HTMLButtonElement | null>(null);

  React.useEffect(() => {
    const firstChild = (selectedChat as HTMLElement)?.firstChild;
    if (firstChild && firstChild instanceof HTMLElement) firstChild.focus();
  }, [selectedChat]);

  const rove = (event: React.KeyboardEvent) => {
    const msgItemsRef = messageItemsRef.current;
    const msgItemsRefChild = msgItemsRef?.firstChild;
    roving(event, setSelectedChat, msgItemsRefChild, selectedChat);
    event.stopPropagation();
  };

  return (
    <Styled.ScrollableList
      role="tabpanel"
      tabIndex={0}
      ref={messageListRef}
      onKeyDown={rove}
    >
      <TransitionGroup>
        {getActiveChats(chats, chatNodeRef, privateChatSelectedCallback)}
      </TransitionGroup>
    </Styled.ScrollableList>
  );
};

interface PrivateChatListContainerProps {
  privateChatSelectedCallback: () => void;
  chats: Partial<Chat>[];
}

const PrivateChatListContainer: React.FC<PrivateChatListContainerProps> = ({ privateChatSelectedCallback, chats }) => {
  return (
    <PrivateChatList chats={chats} privateChatSelectedCallback={privateChatSelectedCallback} />
  );
};

export default PrivateChatListContainer;
