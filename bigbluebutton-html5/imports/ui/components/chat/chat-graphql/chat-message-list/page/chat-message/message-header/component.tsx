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
  currentlyInMeeting: boolean;
  dateTime: Date;
  sameSender: boolean;
  deleteTime: Date | null;
}

const ChatMessageHeader: React.FC<ChatMessageHeaderProps> = ({
  sameSender,
  name,
  currentlyInMeeting,
  dateTime,
  deleteTime,
}) => {
  const intl = useIntl();
  if (sameSender) return null;

  return (
    <Styled.HeaderContent>
      <Styled.ChatHeaderText>
        <Styled.ChatUserName currentlyInMeeting={currentlyInMeeting}>
          {name}
        </Styled.ChatUserName>
        {
          currentlyInMeeting ? null : (
            <Styled.ChatUserOffline>
              {`(${intl.formatMessage(intlMessages.offline)})`}
            </Styled.ChatUserOffline>
          )
        }
        {!deleteTime && (
        <Styled.ChatTime>
          <FormattedTime value={dateTime} />
        </Styled.ChatTime>
        )}
      </Styled.ChatHeaderText>
    </Styled.HeaderContent>
  );
};

export default ChatMessageHeader;
