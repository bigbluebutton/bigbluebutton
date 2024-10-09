import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { checkText } from 'smile2emoji';
import { useMutation } from '@apollo/client';
import Button from '/imports/ui/components/common/button/component';
import { textToMarkdown } from '/imports/ui/components/chat/chat-graphql/chat-message-form/service';
import { CHAT_EDIT_MESSAGE_MUTATION } from '../mutations';
import Styled from './styles';
import logger from '/imports/startup/client/logger';

const intlMessages = defineMessages({
  errorMaxMessageLength: {
    id: 'app.chat.errorMaxMessageLength',
  },
  errorOnUpdateMessage: {
    id: 'app.chat.errorOnUpdateMessage',
  },
});

interface ChatEditMessageFormProps {
  onCancel(): void;
  onAfterSubmit(): void;
  initialMessage: string;
  chatId: string;
  messageId: string;
  sameSender: boolean;
}

const ChatEditMessageForm: React.FC<ChatEditMessageFormProps> = (props) => {
  const {
    onCancel, chatId, initialMessage, messageId, onAfterSubmit, sameSender,
  } = props;
  const [editedMessage, setEditedMessage] = React.useState(initialMessage);
  const [hasErrors, setHasErrors] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const intl = useIntl();

  const [chatEditMessage, {
    loading: chatEditMessageLoading, error: chatEditMessageError,
  }] = useMutation(CHAT_EDIT_MESSAGE_MUTATION);

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const AUTO_CONVERT_EMOJI = CHAT_CONFIG.autoConvertEmoji;
  const MIN_MESSAGE_LENGTH = CHAT_CONFIG.min_message_length;
  const MAX_MESSAGE_LENGTH = CHAT_CONFIG.max_message_length;
  const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  useEffect(() => {
    if (chatEditMessageError && error == null) {
      logger.error({
        logCode: 'update_message_error',
        extraInfo: {
          errorName: chatEditMessageError.name,
          errorMessage: chatEditMessageError.message,
        },
      }, 'Updating chat message failed');
      setError(intl.formatMessage(intlMessages.errorOnUpdateMessage));
    }
  }, [chatEditMessageError]);

  const handleMessageChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    let newMessage = null;
    let newError = null;
    if (AUTO_CONVERT_EMOJI) {
      newMessage = checkText(e.target.value);
    } else {
      newMessage = e.target.value;
    }

    if (newMessage.length > MAX_MESSAGE_LENGTH) {
      newError = intl.formatMessage(
        intlMessages.errorMaxMessageLength,
        { 0: MAX_MESSAGE_LENGTH },
      );
      newMessage = newMessage.substring(0, MAX_MESSAGE_LENGTH);
    }
    setEditedMessage(newMessage);
    setError(newError);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement> | Event) => {
    e.preventDefault();

    const msg = textToMarkdown(editedMessage);

    if (msg.length < MIN_MESSAGE_LENGTH || chatEditMessageLoading) return;

    if (msg.length > MAX_MESSAGE_LENGTH) {
      setHasErrors(true);
      return;
    }

    if (!chatEditMessageLoading) {
      chatEditMessage({
        variables: {
          chatMessageInMarkdownFormat: msg,
          chatId: chatId === PUBLIC_CHAT_ID ? PUBLIC_GROUP_CHAT_ID : chatId,
          messageId,
        },
      });
    }

    setError(null);
    setHasErrors(false);

    onAfterSubmit();
  };

  const handleMessageKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (e) => {
    if (e.code === 'Enter' && !e.shiftKey) {
      e.preventDefault();

      const event = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });
      handleSubmit(event);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%' }}>
      <Styled.Section $sameSender={sameSender}>
        <div>
          <input
            aria-invalid={hasErrors ? 'true' : 'false'}
            value={editedMessage}
            onChange={handleMessageChange}
            onKeyDown={handleMessageKeyDown}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '100%',
              minWidth: 0,
            }}
          />
          {error && (
            <Styled.ChatMessageError data-test="updateMessageIndicatorError">
              {error}
            </Styled.ChatMessageError>
          )}
        </div>
        <Styled.Actions>
          <Button
            label="Cancel"
            onClick={onCancel}
          />
          <Button
            label="Save"
            color="primary"
            type="submit"
            onClick={(e: React.MouseEvent<HTMLInputElement, MouseEvent>) => e.stopPropagation()}
          />
        </Styled.Actions>
      </Styled.Section>
    </form>
  );
};

export default ChatEditMessageForm;
