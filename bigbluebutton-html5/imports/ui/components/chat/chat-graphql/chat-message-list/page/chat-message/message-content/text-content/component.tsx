import React from 'react';
import Styled from './styles';

interface ChatMessageTextContentProps {
  text: string;
  dataTest?: string | null;
}
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  dataTest = 'messageContent',
}) => {
  return (
    <Styled.ChatMessage
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: text }}
      data-test={dataTest}
    />
  );
};
export default ChatMessageTextContent;
