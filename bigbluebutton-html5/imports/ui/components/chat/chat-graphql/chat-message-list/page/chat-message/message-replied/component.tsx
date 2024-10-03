import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled, { DeleteMessage } from './styles';
import Storage from '/imports/ui/services/storage/in-memory';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import ChatMessageTextContent from '../message-content/text-content/component';

const intlMessages = defineMessages({
  deleteMessage: {
    id: 'app.chat.deleteMessage',
    description: '',
  },
});

interface MessageRepliedProps {
  username: string;
  message: string;
  sequence: number;
  userColor: string;
  emphasizedMessage: boolean;
  deletedByUser: string | null;
}

const ChatMessageReplied: React.FC<MessageRepliedProps> = (props) => {
  const {
    message, username, sequence, userColor, emphasizedMessage, deletedByUser,
  } = props;

  const intl = useIntl();

  return (
    <Styled.Container
      $userColor={userColor}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, {
            detail: {
              sequence,
            },
          }),
        );
        Storage.removeItem(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST);
        Storage.setItem(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, sequence);
      }}
    >
      <Styled.Username $userColor={userColor}>{username}</Styled.Username>
      {!deletedByUser && (
        <Styled.Message>
          <ChatMessageTextContent
            text={message}
            emphasizedMessage={emphasizedMessage}
            systemMsg={false}
            dataTest={null}
          />
        </Styled.Message>
      )}
      {deletedByUser && (
        <DeleteMessage>
          {intl.formatMessage(intlMessages.deleteMessage, { 0: deletedByUser })}
        </DeleteMessage>
      )}
    </Styled.Container>
  );
};

export default ChatMessageReplied;
