import React from "react";
import ReactMarkdown from 'react-markdown';
import Styled from './styles';
interface ChatMessageTextContentProps {
  text: string;
  emphasizedMessage: boolean;
}

const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  emphasizedMessage,
}) => {
  return (
    <Styled.ChatMessage emphasizedMessage={emphasizedMessage}>
      <ReactMarkdown>
        {text}
      </ReactMarkdown>
    </Styled.ChatMessage>
  );
};

export default ChatMessageTextContent;