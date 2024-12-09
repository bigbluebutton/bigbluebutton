import React from 'react';
import ReactMarkdown from 'react-markdown';
import Styled from './styles';
import CustomMarkdownLink from '/imports/ui/components/chat/chat-graphql/custom-markdown-components/link/component';

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
        components={{ a: CustomMarkdownLink }}
      >
        {text}
      </ReactMarkdown>
    </Styled.ChatMessage>
  );
};

export default ChatMessageTextContent;
