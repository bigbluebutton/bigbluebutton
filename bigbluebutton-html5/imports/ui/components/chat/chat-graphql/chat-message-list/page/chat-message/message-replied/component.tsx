import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled, { DeleteMessage } from './styles';
import Storage from '/imports/ui/services/storage/in-memory';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import CustomMarkdownLink from '/imports/ui/components/chat/chat-graphql/custom-markdown-components/link/component';
import { findAndReplaceMentions } from '/imports/ui/components/chat/chat-graphql/utils';

const intlMessages = defineMessages({
  deleteMessage: {
    id: 'app.chat.deleteMessage',
    description: '',
  },
});

interface MessageRepliedProps {
  message: string;
  sequence: number;
  emphasizedMessage: boolean;
  deletedByUser: string | null;
  userNames: string[];
}

const ChatMessageReplied: React.FC<MessageRepliedProps> = (props) => {
  const {
    message, sequence, emphasizedMessage, deletedByUser, userNames,
  } = props;

  const intl = useIntl();
  const messageChunks = message.split('\n');

  const { mention: mentionEnabled } = window.meetingClientSettings.public.chat;

  return (
    <Styled.Container
      onClick={(e) => {
        e.stopPropagation();
        if (e.target instanceof HTMLAnchorElement) {
          return;
        }
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, {
            detail: {
              sequence,
            },
          }),
        );
        Storage.setItem(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, sequence);
      }}
    >
      {!deletedByUser && (
        <Styled.Message>
          <Styled.Markdown
            $emphasizedMessage={emphasizedMessage}
            linkTarget="_blank"
            allowedElements={window.meetingClientSettings.public.chat.allowedElements}
            components={{ a: CustomMarkdownLink }}
            unwrapDisallowed
          >
            {mentionEnabled ? findAndReplaceMentions(messageChunks[0], userNames) : messageChunks[0]}
          </Styled.Markdown>
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
