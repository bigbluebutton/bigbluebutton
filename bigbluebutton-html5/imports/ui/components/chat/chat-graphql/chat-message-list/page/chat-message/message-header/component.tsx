import React from 'react';
import { useIntl, defineMessages, FormattedTime } from 'react-intl';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';
import Tooltip from '/imports/ui/components/common/tooltip/container';

const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
  edited: {
    id: 'app.chat.toolbar.edit.edited',
    description: 'Edited',
  },
});

interface ChatMessageHeaderProps {
  name: string;
  currentlyInMeeting: boolean;
  dateTime: Date;
  sameSender: boolean;
  deleteTime: Date | null;
  editTime: Date | null;
  role: string;
}

const ChatMessageHeader: React.FC<ChatMessageHeaderProps> = ({
  sameSender,
  name,
  currentlyInMeeting,
  dateTime,
  deleteTime,
  editTime,
  role,
}) => {
  const intl = useIntl();
  if (sameSender) return null;

  return (
    <Styled.HeaderContent role={role}>
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
        <Styled.Center />
        {!deleteTime && editTime && (
          <Tooltip title={intl.formatTime(editTime, { hour12: false })}>
            <Styled.EditLabel data-test="chatMessageEditedLabel">
              <Icon iconName="pen_tool" />
              <span>{intl.formatMessage(intlMessages.edited)}</span>
            </Styled.EditLabel>
          </Tooltip>
        )}
        {deleteTime && (
          <Styled.EditLabel>
            <Icon iconName="delete" />
          </Styled.EditLabel>
        )}
        <Styled.ChatTime>
          <FormattedTime value={dateTime} hour12={false} />
        </Styled.ChatTime>
      </Styled.ChatHeaderText>
    </Styled.HeaderContent>
  );
};

export default ChatMessageHeader;
