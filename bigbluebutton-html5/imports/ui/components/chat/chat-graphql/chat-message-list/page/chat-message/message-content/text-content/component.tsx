import React from 'react';
import DOMPurify from 'dompurify';
import Styled from './styles';

interface ChatMessageTextContentProps {
  text: string;
  dataTest?: string | null;
}
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  dataTest = 'messageContent',
}) => {
  const sanitizedText = DOMPurify.sanitize(text);

  return (
    <Styled.ChatMessage
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: sanitizedText }}
      data-test={dataTest}
    />
  );
};
export default ChatMessageTextContent;
