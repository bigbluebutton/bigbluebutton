import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';

interface ChatOfflineIndicatorProps {
  participantName: string;
}

const intlMessages = defineMessages({
  partnerDisconnected: {
    id: 'app.chat.partnerDisconnected',
    description: 'System chat message when the private chat partner disconnect from the meeting',
  },
});

const ChatOfflineIndicator: React.FC<ChatOfflineIndicatorProps> = ({
  participantName,
}) => {
  const intl = useIntl();
  return (
    <Styled.ChatOfflineIndicator>
      <span data-test="partnerDisconnected">
        {intl.formatMessage(intlMessages.partnerDisconnected, { participantName })}
      </span>
    </Styled.ChatOfflineIndicator>
  );
};

export default ChatOfflineIndicator;
