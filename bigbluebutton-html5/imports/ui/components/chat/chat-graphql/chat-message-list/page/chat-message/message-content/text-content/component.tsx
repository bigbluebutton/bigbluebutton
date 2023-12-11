import React from 'react';
import ReactMarkdown from 'react-markdown';
import Styled from './styles';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

interface ChatMessageTextContentProps {
  text: string;
  emphasizedMessage: boolean;
}
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  emphasizedMessage,
}) => {
  const [MeetingSettings] = useMeetingSettings();
  const chatConfig = MeetingSettings.public.chat;
  const { allowedElements } = chatConfig;

  return (
    <Styled.ChatMessage emphasizedMessage={emphasizedMessage} data-test="messageContent">
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
