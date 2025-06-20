import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled, { DeleteMessage } from './styles';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import { messageToQuoteMarkdown } from '/imports/ui/components/chat/chat-graphql/service';

const intlMessages = defineMessages({
  deleteMessage: {
    id: 'app.chat.deleteMessage',
    description: '',
  },
});

interface MessageRepliedProps {
  message: string;
  sequence: number;
  deletedByUser: string | null;
}

const ChatMessageReplied: React.FC<MessageRepliedProps> = (props) => {
  const {
    message, sequence, deletedByUser,
  } = props;

  const intl = useIntl();

  return (
    <Styled.Container
      data-test="chatMessageReplied"
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
      }}
    >
      {!deletedByUser && (
        <Styled.Message>
          <Styled.Markdown
            linkTarget="_blank"
            allowedElements={window.meetingClientSettings.public.chat.allowedElements}
            unwrapDisallowed
          >
            {messageToQuoteMarkdown(message)}
          </Styled.Markdown>
        </Styled.Message>
      )}
      {deletedByUser && (
        <DeleteMessage>
          {intl.formatMessage(intlMessages.deleteMessage, { userName: deletedByUser })}
        </DeleteMessage>
      )}
    </Styled.Container>
  );
};

export default ChatMessageReplied;
