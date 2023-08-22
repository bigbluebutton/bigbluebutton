import React from "react";
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
    <Styled.ChatMessage
      emphasizedMessage={emphasizedMessage}
      dangerouslySetInnerHTML={{ __html: text }}
    />
  );
};

export default ChatMessageTextContent;