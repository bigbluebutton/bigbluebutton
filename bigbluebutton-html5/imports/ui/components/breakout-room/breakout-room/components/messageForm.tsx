import { useMutation } from '@apollo/client';
import React, { useCallback, useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { escapeHtml } from '/imports/utils/string-utils';
import { BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL } from '../../mutations';
import Styled from '../styles';

const intlMessages = defineMessages({
  submitLabel: {
    id: 'app.chat.submitLabel',
    description: 'Chat submit button label',
  },
  inputLabel: {
    id: 'app.chat.inputLabel',
    description: 'Chat message input label',
  },
  inputPlaceholder: {
    id: 'app.chat.inputPlaceholder',
    description: 'Chat message input placeholder',
  },
  errorMaxMessageLength: {
    id: 'app.chat.errorMaxMessageLength',
  },
  errorMinMessageLength: {
    id: 'app.chat.errorMinMessageLength',
  },
  errorServerDisconnected: {
    id: 'app.chat.disconnected',
  },
  errorChatLocked: {
    id: 'app.chat.locked',
  },
  chatTitleMsgAllRooms: {
    id: 'app.createBreakoutRoom.chatTitleMsgAllRooms',
    description: 'chat title for send message to all rooms',
  },
});

const BreakoutMessageForm: React.FC = () => {
  const intl = useIntl();

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const minMessageLength = CHAT_CONFIG.min_message_length;
  const maxMessageLength = CHAT_CONFIG.max_message_length;

  const [message, setMessage] = React.useState('');
  const [error, setError] = React.useState('');
  const [hasErrors, setHasErrors] = React.useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>();
  const chatTitle = useRef(intl.formatMessage(intlMessages.chatTitleMsgAllRooms));

  const [sendMessageToAllBreakouts] = useMutation(BREAKOUT_ROOM_SEND_MESSAGE_TO_ALL);

  useEffect(() => {
    const unSentMessage = sessionStorage.getItem('breakoutUnsentMessage');
    if (unSentMessage) {
      setMessage(unSentMessage);
    }
  }, []);

  const verifyForErrors = useCallback((message: string) => {
    if (message.length < minMessageLength) {
      if (!hasErrors) setHasErrors(true);
      setError(intl.formatMessage(intlMessages.errorMinMessageLength, { minMessageLength }));
    } else if ((message.length > maxMessageLength) && !hasErrors) {
      if (!hasErrors) setHasErrors(true);
      setError(intl.formatMessage(intlMessages.errorMaxMessageLength, { maxMessageLength }));
      return true;
    } else {
      setHasErrors(false);
      setError('');
      return false;
    }
    return false;
  }, []);

  const editMessage = useCallback((message: string) => {
    verifyForErrors(message);
    setMessage(message);
    sessionStorage.setItem('breakoutUnsentMessage', message);
    textAreaRef?.current?.focus();
  }, []);

  const sendMessage = useCallback((message: string) => {
    sendMessageToAllBreakouts({
      variables: {
        message,
      },
    });
  }, []);

  const handleSendMessage = useCallback((message: string) => {
    if (!verifyForErrors(message)) {
      sendMessage(escapeHtml(message));
      setMessage('');
      setError('');
      setHasErrors(false);
      sessionStorage.removeItem('breakoutUnsentMessage');
    }
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(message);
    }
  }, [message]);

  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(message);
  }, [message]);

  const handleOnChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    editMessage(e.target.value);
  }, []);

  return (
    <Styled.Form
      onSubmit={handleSubmit}
    >
      <Styled.Wrapper>
        <Styled.Input
          id="message-input"
          innerRef={(ref) => { textAreaRef.current = ref; }}
          placeholder={intl.formatMessage(intlMessages.inputPlaceholder, { chatName: chatTitle.current })}
          aria-label={intl.formatMessage(intlMessages.inputLabel, { chatName: chatTitle.current })}
          aria-invalid={hasErrors ? 'true' : 'false'}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="true"
          value={message}
          onChange={handleOnChange}
          onKeyDown={handleKeyDown}
          async
          onPaste={(e) => { e.stopPropagation(); }}
          onCut={(e) => { e.stopPropagation(); }}
          onCopy={(e) => { e.stopPropagation(); }}
        />
        <Styled.SendButton
          hideLabel
          circle
          aria-label={intl.formatMessage(intlMessages.submitLabel)}
          type="submit"
          disabled={hasErrors || !message}
          label={intl.formatMessage(intlMessages.submitLabel)}
          color="primary"
          icon="send"
          onClick={() => {}}
          data-test="sendMessageButton"
        />
      </Styled.Wrapper>
      { hasErrors ? <Styled.ErrorMessage>{error}</Styled.ErrorMessage> : null }
    </Styled.Form>
  );
};

export default BreakoutMessageForm;
