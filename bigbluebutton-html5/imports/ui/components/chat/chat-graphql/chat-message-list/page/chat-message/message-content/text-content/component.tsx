import React from 'react';
import ReactMarkdown from 'react-markdown';
import Styled from './styles';

interface ChatMessageTextContentProps {
  text: string;
  emphasizedMessage: boolean;
  systemMsg: boolean;
  dataTest?: string | null;
}
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  emphasizedMessage,
  systemMsg,
  dataTest = 'messageContent',
}) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - temporary, while meteor exists in the project
  const { allowedElements } = window.meetingClientSettings.public.chat;

  return (
    <Styled.ChatMessage systemMsg={systemMsg} emphasizedMessage={emphasizedMessage} data-test={dataTest}>
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
