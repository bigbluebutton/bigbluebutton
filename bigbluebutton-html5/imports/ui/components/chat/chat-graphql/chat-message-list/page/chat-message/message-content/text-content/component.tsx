import React, { useMemo } from 'react';
import Styled from './styles';
import { isJumbomoji } from './jumbomoji';

interface ChatMessageTextContentProps {
  text: string;
  dataTest?: string | null;
}
const ChatMessageTextContent: React.FC<ChatMessageTextContentProps> = ({
  text,
  dataTest = 'messageContent',
}) => {
  const jumbomoji = useMemo(() => isJumbomoji(text), [text]);
  return (
    <Styled.ChatMessage
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{ __html: text }}
      data-test={dataTest}
      $jumbomoji={jumbomoji}
    />
  );
};
export default ChatMessageTextContent;
