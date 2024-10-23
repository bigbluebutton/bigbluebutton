import React from 'react';
import ReactMarkdown from 'react-markdown';
import Styled from './styles';

interface ChatMessageTextContentProps {
  text: string;
  emphasizedMessage: boolean;
  dataTest?: string | null;
}
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  emphasizedMessage,
  dataTest = 'messageContent',
}) => {
  const { allowedElements } = window.meetingClientSettings.public.chat;

  return (
    <Styled.ChatMessage emphasizedMessage={emphasizedMessage} data-test={dataTest}>
      <ReactMarkdown
        linkTarget="_blank"
        allowedElements={allowedElements}
        unwrapDisallowed
      >
        {text}
      </ReactMarkdown>
    </Styled.ChatMessage>
  );
};
export default ChatMessageTextContent;
