import React from 'react';
import ReactMarkdown from 'react-markdown';
import Styled from './styles';
import CustomMarkdownLink from '/imports/ui/components/chat/chat-graphql/custom-markdown-components/link/component';
import { findAndReplaceMentions } from '/imports/ui/components/chat/chat-graphql/utils';

interface ChatMessageTextContentProps {
  text: string;
  emphasizedMessage: boolean;
  dataTest?: string | null;
  userNames: string[];
}
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  emphasizedMessage,
  userNames,
  dataTest = 'messageContent',
}) => {
  const { allowedElements, mention: mentionEnabled } = window.meetingClientSettings.public.chat;

  return (
    <Styled.ChatMessage emphasizedMessage={emphasizedMessage} data-test={dataTest}>
      <ReactMarkdown
        linkTarget="_blank"
        allowedElements={allowedElements}
        unwrapDisallowed
        components={{ a: CustomMarkdownLink }}
      >
        {mentionEnabled ? findAndReplaceMentions(text, userNames) : text}
      </ReactMarkdown>
    </Styled.ChatMessage>
  );
};

export default ChatMessageTextContent;
