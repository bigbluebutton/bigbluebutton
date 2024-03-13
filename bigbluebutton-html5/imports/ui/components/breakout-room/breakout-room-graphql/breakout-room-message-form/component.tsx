import React, { useState, useEffect, useRef } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { Meteor } from 'meteor/meteor';
import deviceInfo from '/imports/utils/deviceInfo';
import PropTypes from 'prop-types';
import Styled from './styles';
import { escapeHtml } from '/imports/utils/string-utils';
import { isChatEnabled } from '/imports/ui/services/features';
import { handleSendMessage } from './service';


const CHAT_CONFIG = Meteor.settings.public.chat;

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
  errorServerDisconnected: {
    id: 'app.chat.disconnected',
  },
  errorChatLocked: {
    id: 'app.chat.locked',
  },
});

interface MessageFormProps {
  chatId: string;
  disabled: boolean;
  chatTitle: string;
  connected: boolean;
  locked: boolean;
}

const BreakoutRoomMessageForm: React.FC<MessageFormProps> = ({
  chatId,
  disabled,
  chatTitle,
  connected,
  locked,
}) => {
  const minMessageLength = CHAT_CONFIG.min_message_length;
  const maxMessageLength = CHAT_CONFIG.max_message_length;

  const [message, setMessage] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [hasErrors, setHasErrors] = useState(false);
  const intl = useIntl();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newMessage = e.target.value;
    let newError = null;

    if (newMessage.length > maxMessageLength) {
      newError = intl.formatMessage(intlMessages.errorMaxMessageLength, { 0: maxMessageLength });
      newMessage = newMessage.substring(0, maxMessageLength);
    }

    setMessage(newMessage);
    setError(newError);
  };

  const handleSubmit = (e: React.KeyboardEvent<HTMLFormElement>) => {
    e.preventDefault();

    const msg = message.trim();

    if (msg.length < minMessageLength) return;

    if (disabled || msg.length > maxMessageLength) {
      setHasErrors(true);
      return;
    }

    handleSendMessage(escapeHtml(msg));
    setMessage('');
    setError(null);
    setHasErrors(false);
  };

  const setMessageHint = () => {
    let chatDisabledHint = null;

    if (disabled) {
      if (connected) {
        if (locked) {
          chatDisabledHint = intlMessages.errorChatLocked;
        }
      } else {
        chatDisabledHint = intlMessages.errorServerDisconnected;
      }
    }

    setHasErrors(disabled);
    setError(chatDisabledHint ? intl.formatMessage(chatDisabledHint) : null);
  };

  const setMessageState = () => {
    const unsentMessage = localStorage.getItem(`unsentMessage_${chatId}`);
    setMessage(unsentMessage || '');
  };

  useEffect(() => {
    const { isMobile } = deviceInfo;
    setMessageState();
    setMessageHint();

    if (!isMobile && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  useEffect(() => {
    setMessageHint();
  }, [connected, locked]);

  useEffect(() => {
    localStorage.setItem(`unsentMessage_${chatId}`, message);
    return () => {
      localStorage.setItem(`unsentMessage_${chatId}`, message);
      setMessageState();
    };
  }, [chatId, message]);

  return isChatEnabled() ? (
    <Styled.Form onSubmit={handleSubmit}>
      <Styled.Wrapper>
        <Styled.Input
          ref={textareaRef}
          placeholder={intl.formatMessage(intlMessages.inputPlaceholder, { 0: chatTitle })}
          aria-label={intl.formatMessage(intlMessages.inputLabel, { 0: chatTitle })}
          aria-invalid={hasErrors ? 'true' : 'false'}
          disabled={disabled}
          value={message}
          onChange={handleMessageChange}
          onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.keyCode === 13 && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
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
          disabled={disabled}
          label={intl.formatMessage(intlMessages.submitLabel)}
          color="primary"
          icon="send"
          onClick={() => { }}
          data-test="sendMessageButton"
        />
      </Styled.Wrapper>
      {error && <Styled.ErrorMessage>{error}</Styled.ErrorMessage>}
    </Styled.Form>
  ) : null;
};

export default BreakoutRoomMessageForm;
