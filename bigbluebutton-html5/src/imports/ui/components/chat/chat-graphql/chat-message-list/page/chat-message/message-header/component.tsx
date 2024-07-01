import React from 'react';
import { useIntl, defineMessages, FormattedTime } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
});

interface ChatMessageHeaderProps {
  name: string;
  isOnline: boolean;
  dateTime: Date;
  sameSender: boolean;
}

const ChatMessageHeader: React.FC<ChatMessageHeaderProps> = ({
  sameSender,
  name,
  isOnline,
  dateTime,
}) => {
  const intl = useIntl();
  if (sameSender) return null;

  return (
    <Styled.HeaderContent>
      <Styled.ChatHeaderText>
        <Styled.ChatUserName isOnline={isOnline}>
          {name}
        </Styled.ChatUserName>
        {
          isOnline ? null : (
            <Styled.ChatUserOffline>
              {`(${intl.formatMessage(intlMessages.offline)})`}
            </Styled.ChatUserOffline>
          )
        }
        <Styled.ChatTime>
          <FormattedTime value={dateTime} />
        </Styled.ChatTime>
      </Styled.ChatHeaderText>
    </Styled.HeaderContent>
  );
};

export default ChatMessageHeader;
