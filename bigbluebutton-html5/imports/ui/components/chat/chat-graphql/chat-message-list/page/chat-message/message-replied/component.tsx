import React from 'react';
import Styled from './styles';
import Storage from '/imports/ui/services/storage/in-memory';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import ChatMessageTextContent from '../message-content/text-content/component';

interface MessageRepliedProps {
  username: string;
  message: string;
  sequence: number;
  userColor: string;
  emphasizedMessage: boolean;
}

const ChatMessageReplied: React.FC<MessageRepliedProps> = (props) => {
  const {
    message, username, sequence, userColor, emphasizedMessage,
  } = props;

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
      <Styled.Message>
        <ChatMessageTextContent
          text={message}
          emphasizedMessage={emphasizedMessage}
          systemMsg={false}
          dataTest={null}
        />
      </Styled.Message>
    </Styled.Container>
  );
};

export default ChatMessageReplied;
