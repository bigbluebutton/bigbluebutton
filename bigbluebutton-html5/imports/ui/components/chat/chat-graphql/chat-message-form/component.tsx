import React, { useEffect, useRef } from 'react';
import { throttle } from '/imports/utils/throttle';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { defineMessages, useIntl } from 'react-intl';
import { isChatEnabled } from '/imports/ui/services/features';
import ClickOutside from '/imports/ui/components/click-outside/component';
import Styled from './styles';
import { escapeHtml } from '/imports/utils/string-utils';
import { checkText } from 'smile2emoji';
import deviceInfo from '/imports/utils/deviceInfo';
import { usePreviousValue } from '/imports/ui/components/utils/hooks';
import useChat from '/imports/ui/core/hooks/useChat';
import {
  handleSendMessage,
  startUserTyping,
  stopUserTyping,
} from './service';
import { Chat } from '/imports/ui/Types/chat';
import { Layout } from '../../../layout/layoutTypes';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import Events from '/imports/ui/core/events/events';
import ChatOfflineIndicator from './chat-offline-indicator/component';

interface ChatMessageFormProps {
  minMessageLength: number,
  maxMessageLength: number,
  idChatOpen: string,
  chatId: string,
  connected: boolean,
  disabled: boolean,
  locked: boolean,
  partnerIsLoggedOut: boolean,
  title: string,
  handleClickOutside: Function,
}

const messages = defineMessages({
  submitLabel: {
    id: 'app.chat.submitLabel',
    description: 'Chat submit button label',
  },
  inputLabel: {
    id: 'app.chat.inputLabel',
    description: 'Chat message input label',
  },
  emojiButtonLabel: {
    id: 'app.chat.emojiButtonLabel',
    description: 'Chat message emoji picker button label',
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
  singularTyping: {
    id: 'app.chat.singularTyping',
    description: 'used to indicate when 1 user is typing',
  },
  pluralTyping: {
    id: 'app.chat.pluralTyping',
    description: 'used to indicate when multiple user are typing',
  },
  severalPeople: {
    id: 'app.chat.severalPeople',
    description: 'displayed when 4 or more users are typing',
  },
  titlePublic: {
    id: 'app.chat.titlePublic',
    description: 'Public chat title',
  },
  titlePrivate: {
    id: 'app.chat.titlePrivate',
    description: 'Private chat title',
  },
  partnerDisconnected: {
    id: 'app.chat.partnerDisconnected',
    description: 'System chat message when the private chat partnet disconnect from the meeting',
  },
});

const CHAT_CONFIG = Meteor.settings.public.chat;
const AUTO_CONVERT_EMOJI = Meteor.settings.public.chat.autoConvertEmoji;
const ENABLE_EMOJI_PICKER = Meteor.settings.public.chat.emojiPicker.enable;
const ENABLE_TYPING_INDICATOR = CHAT_CONFIG.typingIndicator.enabled;

const ChatMessageForm: React.FC<ChatMessageFormProps> = ({
  handleClickOutside,
  title,
  disabled,
  idChatOpen,
  partnerIsLoggedOut,
  minMessageLength,
  maxMessageLength,
  chatId,
  connected,
  locked,
}) => {
  if (!isChatEnabled()) return null;
  const intl = useIntl();
  const [hasErrors, setHasErrors] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const textAreaRef = useRef();
  const { isMobile } = deviceInfo;
  const prevChatId = usePreviousValue(chatId);
  const messageRef = useRef();
  messageRef.current = message;
  const updateUnreadMessages = (chatId: string, message: string) => {
    const storedData = localStorage.getItem('unsentMessages') || '{}';
    const unsentMessages = JSON.parse(storedData);
    unsentMessages[chatId] = message;
    localStorage.setItem('unsentMessages', JSON.stringify(unsentMessages));
  }

  useEffect(() => {
    setMessageHint();
    if (!isMobile) {
      if (textAreaRef?.current) textAreaRef.current.textarea.focus();
    }

    return () => {
      const unsentMessage = messageRef.current;
      updateUnreadMessages(chatId, unsentMessage);
    }
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem('unsentMessages') || '{}';
    const unsentMessages = JSON.parse(storedData);

    if (prevChatId) {
      updateUnreadMessages(prevChatId, message);
    }

    const unsentMessage = unsentMessages[chatId] || '';
    setMessage(unsentMessage);

    if (!isMobile) {
      if (textAreaRef?.current) textAreaRef.current.textarea.focus();
    }
    setError(null);
    setHasErrors(false);
  }, [chatId]);

  useEffect(() => {
    setMessageHint();
  }, [connected, locked, partnerIsLoggedOut]);

  const setMessageHint = () => {
    let chatDisabledHint = null;

    if (disabled && !partnerIsLoggedOut) {
      if (connected) {
        if (locked) {
          chatDisabledHint = messages.errorChatLocked;
        }
      } else {
        chatDisabledHint = messages.errorServerDisconnected;
      }
    }

    setHasErrors(disabled);
    setError(chatDisabledHint ? intl.formatMessage(chatDisabledHint) : null);
  }

  const handleSubmit = (e) => {
    e.preventDefault();

    let msg = message.trim();

    if (msg.length < minMessageLength) return;

    if (disabled
      || msg.length > maxMessageLength) {
      setHasErrors(true);
      return;
    }

    handleSendMessage(escapeHtml(msg), chatId);
    setMessage('');
    updateUnreadMessages(chatId, '');
    setHasErrors(false);
    setShowEmojiPicker(false);
    if (ENABLE_TYPING_INDICATOR) stopUserTyping();
    const sentMessageEvent = new CustomEvent(Events.SENT_MESSAGE);
    window.dispatchEvent(sentMessageEvent);
  }

  const handleEmojiSelect = (emojiObject: { native: string }) => {
    const txtArea = textAreaRef?.current?.textarea;
    const cursor = txtArea.selectionStart;

    setMessage(
      message.slice(0, cursor)
      + emojiObject.native
      + message.slice(cursor)
    );

    const newCursor = cursor + emojiObject.native.length;
    setTimeout(() => txtArea.setSelectionRange(newCursor, newCursor), 10);
  }

  const handleMessageChange = (e: React.FormEvent<HTMLInputElement>) => {
    let newMessage = null;
    let newError = null;
    if (AUTO_CONVERT_EMOJI) {
      newMessage = checkText(e.target.value);
    } else {
      newMessage = e.target.value;
    }

    if (newMessage.length > maxMessageLength) {
      newError = intl.formatMessage(
        messages.errorMaxMessageLength,
        { 0: maxMessageLength },
      );
      newMessage = newMessage.substring(0, maxMessageLength);
    }

    setMessage(newMessage);
    setError(newError);
    handleUserTyping(newError)
  }

  const handleUserTyping = (error?: boolean) => {
    if (error || !ENABLE_TYPING_INDICATOR) return;
    startUserTyping(chatId);
  }

  const handleMessageKeyDown = (e: React.FormEvent<HTMLInputElement>) => {
    // TODO Prevent send message pressing enter on mobile and/or virtual keyboard
    if (e.keyCode === 13 && !e.shiftKey) {
      e.preventDefault();

      const event = new Event('submit', {
        bubbles: true,
        cancelable: true,
      });

      handleSubmit(event);
    }
  }

  const renderForm = () => {
    const formRef = useRef();

    return (
      <Styled.Form
        ref={formRef}
        onSubmit={handleSubmit}
      >
        {showEmojiPicker ? (
          <Styled.EmojiPickerWrapper>
            <Styled.EmojiPicker
              onEmojiSelect={(emojiObject) => handleEmojiSelect(emojiObject)}
              showPreview={false}
              showSkinTones={false}
            />
          </Styled.EmojiPickerWrapper>
        ) : null}
        <Styled.Wrapper>
          <Styled.Input
            id="message-input"
            ref={textAreaRef}
            placeholder={intl.formatMessage(messages.inputPlaceholder, { 0: title })}
            aria-label={intl.formatMessage(messages.inputLabel, { 0: title })}
            aria-invalid={hasErrors ? 'true' : 'false'}
            autoCorrect="off"
            autoComplete="off"
            spellCheck="true"
            disabled={disabled || partnerIsLoggedOut}
            value={message}
            onChange={handleMessageChange}
            onKeyDown={handleMessageKeyDown}
            onPaste={(e) => { e.stopPropagation(); }}
            onCut={(e) => { e.stopPropagation(); }}
            onCopy={(e) => { e.stopPropagation(); }}
            async
          />
          {ENABLE_EMOJI_PICKER ? (
            <Styled.EmojiButton
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              icon="happy"
              color="light"
              ghost
              type="button"
              circle
              hideLabel
              label={intl.formatMessage(messages.emojiButtonLabel)}
              data-test="emojiPickerButton"
            />
          ) : null}
          <Styled.SendButton
            hideLabel
            circle
            aria-label={intl.formatMessage(messages.submitLabel)}
            type="submit"
            disabled={disabled || partnerIsLoggedOut}
            label={intl.formatMessage(messages.submitLabel)}
            color="primary"
            icon="send"
            onClick={() => { }}
            data-test="sendMessageButton"
          />
        </Styled.Wrapper>
        {
          error && (
            <Styled.Error>
              {error}
            </Styled.Error>
          )
        }

      </Styled.Form>
    );
  }

  return ENABLE_EMOJI_PICKER ? (
    <ClickOutside
      onClick={() => handleClickOutside()}
    >
      {renderForm()}
    </ClickOutside>
  ) : renderForm();
};

const ChatMessageFormContainer: React.FC = ({
  // connected, move to network status
}) => {
  const intl = useIntl();
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const idChatOpen: string = layoutSelect((i: Layout) => i.idChatOpen);
  const chat = useChat((c: Partial<Chat>) => {
    const participant = c?.participant ? {
      participant: {
        name: c?.participant?.name,
        isModerator: c?.participant?.isModerator,
        isOnline: c?.participant?.isOnline,
      }
    } : {};

    return {
      ...participant,
      chatId: c?.chatId,
      public: c?.public,
    };
  }, idChatOpen) as Partial<Chat>;

  const title = chat?.participant?.name
    ? intl.formatMessage(messages.titlePrivate, { 0: chat?.participant?.name })
    : intl.formatMessage(messages.titlePublic);


  const meeting = useMeeting((m) => {
    return {
      lockSettings: {
        hasActiveLockSetting: m?.lockSettings?.hasActiveLockSetting,
        disablePublicChat: m?.lockSettings?.disablePublicChat,
        disablePrivateChat: m?.lockSettings?.disablePrivateChat,
      }
    };
  });

  const locked = chat?.public
    ? meeting?.lockSettings?.disablePublicChat
    : meeting?.lockSettings?.disablePrivateChat;

  const handleClickOutside = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };

  if (chat?.participant && !chat.participant.isOnline) {
    return <ChatOfflineIndicator participantName={chat.participant.name} />;
  }

  return <ChatMessageForm
    {...{
      minMessageLength: CHAT_CONFIG.min_message_length,
      maxMessageLength: CHAT_CONFIG.max_message_length,
      idChatOpen,
      handleClickOutside,
      chatId: idChatOpen,
      connected: true, //TODO: monitoring network status
      disabled: locked ?? false,
      title,
      // if participant is not defined, it means that the chat is public
      partnerIsLoggedOut: chat?.participant ? !chat?.participant?.isOnline : false,
      locked: locked ?? false,
    }}
  />;
};

export default ChatMessageFormContainer;
