import React from 'react';
import ChatHeader from './chat-header/component';
import { layoutSelect, layoutSelectInput } from '../../layout/context';
import { Input, Layout } from '../../layout/layoutTypes';
import Styled from './styles';
import ChatMessageListContainer from './chat-message-list/component';
import ChatMessageFormContainer from './chat-message-form/component';
import ChatTypingIndicatorContainer from './chat-typing-indicator/component';
import ChatPopupContainer from './chat-popup/component';
import { PANELS, ACTIONS } from '/imports/ui/components/layout/enums';
import { CircularProgress } from "@mui/material";
interface ChatProps {

}

const Chat: React.FC<ChatProps> = () => {
  return (
    <Styled.Chat>
      <ChatHeader />
      <Styled.ChatMessages>
        <ChatPopupContainer />
        <ChatMessageListContainer />
      </Styled.ChatMessages>
      <ChatMessageFormContainer />
      <ChatTypingIndicatorContainer />
    </Styled.Chat>
  );
};

const ChatLoading: React.FC = () => {
  return <Styled.Chat >
    <CircularProgress style={{ alignSelf: 'center' }} />
  </Styled.Chat>;
};

const ChatContainer: React.FC = () => {
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);

  if (sidebarContent.sidebarContentPanel !== PANELS.CHAT) return null;
  if (!idChatOpen) return <ChatLoading />;
  return <Chat />;
};

export default ChatContainer;