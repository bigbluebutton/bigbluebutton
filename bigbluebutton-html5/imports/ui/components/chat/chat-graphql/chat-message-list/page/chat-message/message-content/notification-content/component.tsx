import React from 'react';
import Styled from './styles';

interface ChatMessageNotificationContentProps {
  text: string;
  iconName?: string;
}

const ChatMessageNotificationContent: React.FC<ChatMessageNotificationContentProps> = (props) => {
  const { text, iconName } = props;
  return (
    <Styled.Root className="bbb-chat-message__notice" data-test="chatMessageNotificationContent">
      <Styled.Typography>
        {iconName && <Styled.Icon iconName={iconName} />}
        {text}
      </Styled.Typography>
    </Styled.Root>
  );
};

export default ChatMessageNotificationContent;
