import React from "react";
import Styled from './styles';
import { defineMessages, useIntl } from "react-intl";

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
      <span id="partnerDisconnected">
        {intl.formatMessage(intlMessages.partnerDisconnected, { 0: participantName })}
      </span>
    </Styled.ChatOfflineIndicator>
  );
};

export default ChatOfflineIndicator;