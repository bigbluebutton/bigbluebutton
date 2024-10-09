import React, { useEffect, useState } from 'react';
import Styled from './styles';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import ChatMessageTextContent from '../chat-message-list/page/chat-message/message-content/text-content/component';
import Storage from '/imports/ui/services/storage/in-memory';

const ChatReplyIntention = () => {
  const [username, setUsername] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [emphasizedMessage, setEmphasizedMessage] = useState<boolean>();
  const [sequence, setSequence] = useState<number>();

  useEffect(() => {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        setUsername(e.detail.username);
        setMessage(e.detail.message);
        setEmphasizedMessage(e.detail.emphasizedMessage);
        setSequence(e.detail.sequence);
      }
    };

    window.addEventListener(ChatEvents.CHAT_REPLY_INTENTION, handler);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_REPLY_INTENTION, handler);
    };
  }, []);

  const { animations } = useSettings(SETTINGS.APPLICATION) as {
    animations: boolean;
  };

  return (
    <Styled.Container
      $hidden={!username || !message}
      $animations={animations}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, {
            detail: {
              sequence,
            },
          }),
        );
        Storage.removeItem(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST);
        if (sequence) Storage.setItem(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, sequence);
      }}
    >
      <Styled.Username>{username}</Styled.Username>
      <Styled.Message>
        <ChatMessageTextContent
          text={message || ''}
          emphasizedMessage={!!emphasizedMessage}
          systemMsg={false}
          dataTest={null}
        />
      </Styled.Message>
      <Styled.CloseBtn
        onClick={() => {
          setMessage(undefined);
          setUsername(undefined);
        }}
        icon="close"
        ghost
        circle
        color="light"
        size="sm"
      />
    </Styled.Container>
  );
};

export default ChatReplyIntention;
