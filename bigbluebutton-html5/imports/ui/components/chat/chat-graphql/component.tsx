import React, { useRef, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Button } from '@mui/material';
import BackButton from '/imports/ui/components/chat/chat-graphql/private-back-button/component';
import ChatHeader from './chat-header/component';
import { layoutSelect, layoutSelectInput } from '../../layout/context';
import { Input, Layout } from '../../layout/layoutTypes';
import Styled from './styles';
import ChatMessageListContainer from './chat-message-list/component';
import PrivateChatListContainer from '/imports/ui/components/chat/chat-graphql/user-messages/private-chat-list/component';
import ChatMessageFormContainer from './chat-message-form/component';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';
import usePendingChat from '/imports/ui/core/local-states/usePendingChat';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat as ChatType } from '/imports/ui/Types/chat';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { ChatEvents } from '/imports/ui/core/enums/chat';

const intlMessages = defineMessages({
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'title for public chat',
  },
  titlePrivate: {
    id: 'app.chat.titlePrivate',
    description: 'Private chat title',
  },
});

interface ChatProps {
  publicUnreadMessages: boolean;
  privateUnreadMessages: boolean;
  chatId: string;
  participantName: string;
}

const Chat: React.FC<ChatProps> = ({
  publicUnreadMessages,
  privateUnreadMessages,
  chatId,
  participantName,
}) => {
  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  const isEditingMessage = useRef(false);
  const [showMessages, setShowMessages] = useState(chatId === PUBLIC_GROUP_CHAT_ID);
  const [privateList, setPrivateList] = useState(false); // novo estado
  const layoutContextDispatch = layoutDispatch();
  const intl = useIntl();

  const handleClickSelectChat = (isPublicChat: boolean) => {
    setShowMessages(isPublicChat);
    setPrivateList(false);

    if (isPublicChat) {
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: PUBLIC_GROUP_CHAT_ID,
      });
    } else {
      setPrivateList(true);
    }
  };

  const handleClickReturnPrivateList = () => {
    setPrivateList(true);
  };

  React.useEffect(() => {
    const handleMouseDown = (e: MouseEvent) => {
      if (window.getSelection && e.button !== 2) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
        }
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isEditingMessage.current) {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_CANCEL_EDIT_REQUEST),
        );
      }
    };

    const handleEditingMessage = (e: Event) => {
      if (e instanceof CustomEvent) {
        isEditingMessage.current = true;
      }
    };

    const handleCancelEditingMessage = (e: Event) => {
      if (e instanceof CustomEvent) {
        isEditingMessage.current = false;
      }
    };

    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleEditingMessage);
    window.addEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelEditingMessage);

    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleEditingMessage);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelEditingMessage);
    };
  }, []);

  return (
    <>
      <ChatHeader />
      <Styled.Separator />
      <Styled.ContentWrapper>
        <Styled.ButtonsWrapper>
          <Button
            variant={showMessages ? 'contained' : 'outlined'}
            color="primary"
            size="medium"
            sx={{
              position: 'relative',
              borderRadius: '16px',
              width: '100%',
              marginRight: '8px',
              padding: '8px 16px',
              textTransform: 'none',
              backgroundColor: showMessages ? 'primary.main' : '#E3F2FD',
              color: showMessages ? '#FFFFFF' : '#B0BEC5',
              borderColor: showMessages ? 'transparent' : '#BBDEFB',
            }}
            onClick={() => handleClickSelectChat(true)}
          >
            {intl.formatMessage(intlMessages.titlePublic)}
            {publicUnreadMessages && (
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                backgroundColor: 'red',
                borderRadius: '50%',
              }}
              />
            )}
          </Button>
          <Button
            variant={!showMessages ? 'contained' : 'outlined'}
            color="primary"
            size="medium"
            sx={{
              position: 'relative',
              borderRadius: '16px',
              width: '100%',
              padding: '8px 16px',
              textTransform: 'none',
              backgroundColor: !showMessages ? 'primary.main' : '#E3F2FD',
              color: !showMessages ? '#FFFFFF' : '#B0BEC5',
              borderColor: !showMessages ? 'transparent' : '#BBDEFB',
            }}
            onClick={() => handleClickSelectChat(false)}
          >
            {intl.formatMessage(intlMessages.titlePrivate)}
            {privateUnreadMessages && (
              <span style={{
                position: 'absolute',
                bottom: '8px',
                right: '8px',
                width: '8px',
                height: '8px',
                backgroundColor: 'red',
                borderRadius: '50%',
              }}
              />
            )}
          </Button>
        </Styled.ButtonsWrapper>
        {privateList ? (
          <PrivateChatListContainer />
        ) : (
          <>
            {!showMessages && !privateList && (
              <BackButton onClick={handleClickReturnPrivateList} title={participantName} />
            )}
            <ChatMessageListContainer />
            <ChatMessageFormContainer />
          </>
        )}
      </Styled.ContentWrapper>
    </>
  );
};

export const ChatLoading: React.FC = () => {
  return <Styled.CircularProgressContainer />;
};

const ChatContainer: React.FC = () => {
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const { data: chats } = useChat((chat) => {
    return {
      chatId: chat.chatId,
      participant: chat.participant,
      totalUnread: chat.totalUnread,
    };
  }) as GraphqlDataHookSubscriptionResponse<Partial<ChatType>[]>;

  const [pendingChat, setPendingChat] = usePendingChat();

  const PUBLIC_GROUP_CHAT_ID = window.meetingClientSettings.public.chat.public_group_id;
  const publicUnreadMessages = !!chats?.some((chat) => (
    chat.chatId === PUBLIC_GROUP_CHAT_ID
    && chat?.totalUnread
    && chat.totalUnread > 0
  ));
  const privateUnreadMessages = !!chats?.some((chat) => (
    chat.chatId !== PUBLIC_GROUP_CHAT_ID
    && chat?.totalUnread
    && chat.totalUnread > 0
  ));

  let participantName = '';
  const currentChat = chats?.find((chat) => chat.chatId === idChatOpen);
  if (currentChat && currentChat.participant) {
    participantName = currentChat.participant.name || '';
  }

  if (pendingChat && chats) {
    const chat = chats.find((c) => {
      return c.participant?.userId === pendingChat;
    });
    if (chat) {
      setPendingChat('');
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: chat.chatId,
      });
    }
  }

  if (sidebarContent.sidebarContentPanel !== PANELS.CHAT) return null;
  if (!idChatOpen) return <ChatLoading />;

  return (
    <Chat
      publicUnreadMessages={publicUnreadMessages}
      privateUnreadMessages={privateUnreadMessages}
      participantName={participantName}
      chatId={idChatOpen}
    />
  );
};

export default ChatContainer;
