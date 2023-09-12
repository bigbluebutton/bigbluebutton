import React from 'react';
import ChatHeader from './chat-header/component';
import { layoutSelect, layoutSelectInput } from '../../layout/context';
import { Input, Layout } from '../../layout/layoutTypes';
import Styled from './styles';
import ChatMessageListContainer from './chat-message-list/component';
import ChatMessageFormContainer from './chat-message-form/component';
import ChatTypingIndicatorContainer from './chat-typing-indicator/component';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';
import { CircularProgress } from "@mui/material";
import usePendingChat from '/imports/ui/core/local-states/usePendingChat';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat as ChatType } from '/imports/ui/Types/chat';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import browserInfo from '/imports/utils/browserInfo';
interface ChatProps {

}

const Chat: React.FC<ChatProps> = () => {
  const { isChrome } = browserInfo;
  return (
    <Styled.Chat isChrome={isChrome}>
      <ChatHeader />
      <ChatMessageListContainer />
      <ChatMessageFormContainer />
      <ChatTypingIndicatorContainer />
    </Styled.Chat>
  );
};

const ChatLoading: React.FC = () => {
  const { isChrome } = browserInfo;
  return (
    <Styled.Chat isChrome={isChrome}>
      <CircularProgress style={{ alignSelf: 'center' }} />
    </Styled.Chat>
  );
};

const ChatContainer: React.FC = () => {
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const layoutContextDispatch = layoutDispatch();
  const chats = useChat((chat) => {
    return {
      chatId: chat.chatId,
      participant: chat.participant,
    };
  }) as Partial<ChatType>[];

  const [pendingChat, setPendingChat] = usePendingChat();

  if (pendingChat) {
    const chat = chats.find((c) => { return c.participant?.userId === pendingChat });
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
  return <Chat />;
};

export default ChatContainer;