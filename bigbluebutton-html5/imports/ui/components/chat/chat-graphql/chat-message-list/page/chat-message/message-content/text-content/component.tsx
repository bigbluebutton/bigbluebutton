import React from 'react';
import ReactMarkdown from 'react-markdown';
import Styled from './styles';
import { messageToMarkdown } from '/imports/ui/components/chat/chat-graphql/service';

interface ChatMessageTextContentProps {
  text: string;
  dataTest?: string | null;
}
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  dataTest = 'messageContent',
}) => {
  const { allowedElements } = window.meetingClientSettings.public.chat;

  return (
    <Styled.ChatMessage data-test={dataTest}>
      <ReactMarkdown
        linkTarget="_blank"
        allowedElements={allowedElements}
        unwrapDisallowed
      >
        {messageToMarkdown(text)}
      </ReactMarkdown>
    </Styled.ChatMessage>
  );
};
export default ChatMessageTextContent;
