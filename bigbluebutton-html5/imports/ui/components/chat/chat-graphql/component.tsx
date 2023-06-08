import React from 'react';
import ChatHeader from './chat-header/component';
import { layoutSelect } from '../../layout/context';
import { Layout } from '../../layout/layoutTypes';
import Styled from './styles';
import ChatMessageListContainer from './chat-message-list/component';
import ChatMessageFormContainer from './chat-message-form/component';
import ChatTypingIndicatorContainer from './chat-typing-indicator/component';
import ChatPopupContainer from './chat-popup/component';

interface ChatProps {

}

const Chat: React.FC<ChatProps> = () => {
  return (
    <Styled.Chat>
      <ChatHeader />
      <ChatPopupContainer />
      <ChatMessageListContainer />
      <ChatMessageFormContainer />
      <ChatTypingIndicatorContainer />
    </Styled.Chat>
  );
};

const ChatContainer: React.FC = () => {
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  if (!idChatOpen) return null;
  return <Chat />;
};

export default ChatContainer;