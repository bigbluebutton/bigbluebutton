import React, { useMemo } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import ChatListItem from './chat-list-item/component';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import deviceInfo from '/imports/utils/deviceInfo';
import roveBuilder from '/imports/ui/core/utils/keyboardRove';
import { useIsChatEnabled } from '/imports/ui/services/features';

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

const getActiveChats = (chats: Chat[], chatNodeRef: React.Ref<HTMLButtonElement>) => chats.map((chat, idx) => (
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
        index={idx}
      />
    </Styled.ListTransition>
  </CSSTransition>
));

const ChatList: React.FC<ChatListProps> = ({ chats }) => {
  const messageListRef = React.useRef<HTMLDivElement | null>(null);
  const messageItemsRef = React.useRef<HTMLDivElement | null>(null);
  const chatNodeRef = React.useRef<HTMLButtonElement | null>(null);

  const rove = useMemo(() => roveBuilder(messageItemsRef, 'chat-list'), []);

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
          onKeyDown={(e:React.KeyboardEvent<HTMLDivElement>) => rove(e)}
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
  const isChatEnabled = useIsChatEnabled();
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const allowedChats = isChatEnabled ? chats : chats?.filter((c) => c.chatId !== PUBLIC_GROUP_CHAT_ID);
  if (allowedChats && allowedChats.length) {
    return (
      <ChatList chats={allowedChats} />
    );
  } return <></>;
};

export default ChatListContainer;
