import React from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { Message } from '/imports/ui/Types/message';
import Auth from '/imports/ui/services/auth';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import { ReadIcon, IconWrapper } from './styles';

const intlMessages = defineMessages({
  messageReadLabel: {
    id: 'app.chat.messageRead',
    description: 'Label for the message read indicatior',
  }
});

interface MessageReadConfirmationProps {
  message: Message;
  recipientLastSeenAt: string;
}

const CONFIRMATION_READ_ICON = 'check';

const MessageReadConfirmation: React.FC<MessageReadConfirmationProps> = ({
  message,
  recipientLastSeenAt,
}) => {
  const intl = useIntl();
  const isRead = new Date(recipientLastSeenAt).getTime() >= new Date(message?.createdAt).getTime();
  const isFromMe = Auth.userID === message?.user?.userId;
  
  if (!isFromMe || !isRead) return null;

  return (
    <Tooltip title={intl.formatMessage(intlMessages.messageReadLabel)}>
      <IconWrapper>
        <ReadIcon iconName={CONFIRMATION_READ_ICON} />
      </IconWrapper>
    </Tooltip>
  );
};

export default MessageReadConfirmation;
