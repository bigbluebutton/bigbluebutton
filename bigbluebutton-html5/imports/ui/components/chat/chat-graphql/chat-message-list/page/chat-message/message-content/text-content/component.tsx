
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
}) => (
  <Styled.ChatMessage
    emphasizedMessage={emphasizedMessage}
    dangerouslySetInnerHTML={{ __html: text }}
  />
);
}) => {
  // @ts-ignore - temporary, while meteor exists in the project
  const { allowedElements } = Meteor.settings.public.chat;

  return (
    <Styled.ChatMessage emphasizedMessage={emphasizedMessage}>
      <ReactMarkdown
        linkTarget="_blank"
        allowedElements={allowedElements}
        unwrapDisallowed={true}
      >
        {text}
      </ReactMarkdown>
    </Styled.ChatMessage>
  );
};

export default ChatMessageTextContent;
