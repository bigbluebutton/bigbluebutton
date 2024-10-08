import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import ChatListItem from './chat-list-item/component';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import Service from '/imports/ui/components/user-list/service';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import deviceInfo from '/imports/utils/deviceInfo';

const { isMobile } = deviceInfo;

const intlMessages = defineMessages({
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },
});

interface ChatListProps {
  chats: Chat[],
}

const getActiveChats = (chats: Chat[], chatNodeRef: React.Ref<HTMLButtonElement>) => chats.map((chat) => (
  <CSSTransition
    classNames="transition"
    appear
    enter
    exit={false}
    timeout={0}
    component="div"
    key={chat.chatId}
    nodeRef={chatNodeRef}
  >
    <Styled.ListTransition>
      <ChatListItem
        chat={chat}
        chatNodeRef={chatNodeRef}
      />
    </Styled.ListTransition>
  </CSSTransition>
));

const ChatList: React.FC<ChatListProps> = ({ chats }) => {
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

  const intl = useIntl();
  return (
    <Styled.Messages>
      <Styled.Container>
        <Styled.MessagesTitle data-test="messageTitle">
          {intl.formatMessage(intlMessages.messagesTitle)}
        </Styled.MessagesTitle>
      </Styled.Container>
      {!isMobile ? (
        <Styled.ScrollableList
          role="tabpanel"
          tabIndex={0}
          ref={messageListRef}
          onKeyDown={rove}
        >
          <Styled.List ref={messageItemsRef}>
            <TransitionGroup>
              {getActiveChats(chats, chatNodeRef) ?? null}
            </TransitionGroup>
          </Styled.List>
        </Styled.ScrollableList>
      )
        : (getActiveChats(chats, chatNodeRef) ?? null) }
    </Styled.Messages>
  );
};

const ChatListContainer: React.FC = () => {
  const { data: chats } = useChat((chat) => chat) as GraphqlDataHookSubscriptionResponse<Chat[]>;
  if (chats) {
    return (
      <ChatList chats={chats} />
    );
  } return <></>;
};

export default ChatListContainer;
