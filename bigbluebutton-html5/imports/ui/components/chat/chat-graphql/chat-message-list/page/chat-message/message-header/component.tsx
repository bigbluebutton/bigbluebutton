import React from "react";
import Styled from './styles';
import { useIntl, defineMessages, FormattedTime } from "react-intl";


const intlMessages = defineMessages({
  offline: {
    id: 'app.chat.offline',
    description: 'Offline',
  },
});


interface ChatMessageHeaderProps {
  name: string;
  avatar: string;
  color: string;
  isModerator: boolean;
  isOnline: boolean;
  dateTime: Date;
  sameSender: boolean;
}

const ChatMessageHeader: React.FC<ChatMessageHeaderProps> = ({
  sameSender,
  name,
  color,
  isModerator,
  avatar,
  isOnline,
  dateTime,
}) => {
  const intl = useIntl();
  if (sameSender) return null;

  return (
    <Styled.HeaderContent>
      <Styled.ChatAvatar
        avatar={avatar}
        color={color}
        moderator={isModerator}
      >
        {name.toLowerCase().slice(0, 2) || "  "}
      </Styled.ChatAvatar>
      <Styled.ChatHeaderText>
        <Styled.ChatUserName>
          {name}
        </Styled.ChatUserName>
        {
          isOnline ? null : (
            <Styled.ChatUserOffline
            >
              {`(${intl.formatMessage(intlMessages.offline)})`}
            </Styled.ChatUserOffline>
          )
        }
        <Styled.ChatTime>
          <FormattedTime value={dateTime} />
        </Styled.ChatTime>
      </Styled.ChatHeaderText>
    </Styled.HeaderContent>
  )
};

export default ChatMessageHeader;