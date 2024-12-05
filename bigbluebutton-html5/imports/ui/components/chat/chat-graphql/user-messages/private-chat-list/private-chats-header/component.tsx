import React from 'react';
import { useIntl, defineMessages, FormattedTime } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
});

interface PrivateChatListHeaderProps {
  name: string;
  currentlyInMeeting: boolean;
  dateTime: Date;
}

const PrivateChatListHeader: React.FC<PrivateChatListHeaderProps> = ({
  name,
  currentlyInMeeting,
  dateTime,
}) => {
  const intl = useIntl();

  return (
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
        <Styled.ChatTime>
          <FormattedTime value={dateTime} hour12={false} />
        </Styled.ChatTime>
      </Styled.ChatHeaderText>
  );
};

export default PrivateChatListHeader;
