import React from 'react';
import Styled from './styles';

interface ChatMessageNotificationContentProps {
  text: string;
  iconName?: string;
}

const ChatMessageNotificationContent: React.FC<ChatMessageNotificationContentProps> = (props) => {
  const { text, iconName } = props;
  return (
    <Styled.Root data-test="chatMessageNotificationContent">
      {iconName && <Styled.Icon iconName={iconName} />}
      <Styled.Typography>
        {text}
      </Styled.Typography>
    </Styled.Root>
  );
};

export default ChatMessageNotificationContent;
