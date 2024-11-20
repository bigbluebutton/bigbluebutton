import React, { useEffect, useState } from 'react';
import Styled from './styles';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import Storage from '/imports/ui/services/storage/in-memory';
import { findAndReplaceMentions } from '/imports/ui/components/chat/chat-graphql/utils';
import CustomMarkdownLink from '/imports/ui/components/chat/chat-graphql/custom-markdown-components/link/component';

interface ChatReplyIntentionProps {
  userNames: string[];
}

const ChatReplyIntention: React.FC<ChatReplyIntentionProps> = (props) => {
  const { userNames } = props;
  const [username, setUsername] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [emphasizedMessage, setEmphasizedMessage] = useState<boolean>();
  const [sequence, setSequence] = useState<number>();

  useEffect(() => {
    const handleReplyIntention = (e: Event) => {
      if (e instanceof CustomEvent) {
        setUsername(e.detail.username);
        setMessage(e.detail.message);
        setEmphasizedMessage(e.detail.emphasizedMessage);
        setSequence(e.detail.sequence);
      }
    };

    const handleCancelReplyIntention = (e: Event) => {
      if (e instanceof CustomEvent) {
        setUsername(undefined);
        setMessage(undefined);
        setEmphasizedMessage(undefined);
        setSequence(undefined);
      }
    };

    window.addEventListener(ChatEvents.CHAT_REPLY_INTENTION, handleReplyIntention);
    window.addEventListener(ChatEvents.CHAT_CANCEL_REPLY_INTENTION, handleCancelReplyIntention);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_REPLY_INTENTION, handleReplyIntention);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_REPLY_INTENTION, handleCancelReplyIntention);
    };
  }, []);

  const { animations } = useSettings(SETTINGS.APPLICATION) as {
    animations: boolean;
  };

  const hidden = !username || !message;
  const messageChunks = message ? message.split('\n') : null;

  const { mention: mentionEnabled } = window.meetingClientSettings.public.chat;

  const replaceMentions = (msg: string) => {
    return mentionEnabled ? findAndReplaceMentions(msg, userNames) : msg;
  };

  return (
    <Styled.Container
      $hidden={hidden}
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
      <Styled.Message>
        <Styled.Markdown
          $emphasizedMessage={!!emphasizedMessage}
          components={{ a: CustomMarkdownLink }}
        >
          {messageChunks ? replaceMentions(messageChunks[0]) : ''}
        </Styled.Markdown>
      </Styled.Message>
      <Styled.CloseBtn
        onClick={(e) => {
          e.stopPropagation();
          window.dispatchEvent(
            new CustomEvent(ChatEvents.CHAT_CANCEL_REPLY_INTENTION),
          );
        }}
        icon="close"
        tabIndex={hidden ? -1 : 0}
        aria-hidden={hidden}
      />
    </Styled.Container>
  );
};

export default ChatReplyIntention;
