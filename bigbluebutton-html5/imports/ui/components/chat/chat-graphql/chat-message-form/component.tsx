/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  ChangeEvent,
  RefObject,
  useEffect,
  useRef,
} from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import { ChatFormCommandsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/enums';
import { FillChatFormCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/types';
import { ChatFormEventPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-events/chat/form/types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { defineMessages, useIntl } from 'react-intl';
import { isChatEnabled } from '/imports/ui/services/features';
import ClickOutside from '/imports/ui/components/click-outside/component';
import { checkText } from 'smile2emoji';
import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';
import { usePreviousValue } from '/imports/ui/components/utils/hooks';
import useChat from '/imports/ui/core/hooks/useChat';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import {
  textToMarkdown,
} from './service';
import { Chat } from '/imports/ui/Types/chat';
import { Layout } from '../../../layout/layoutTypes';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

import ChatOfflineIndicator from './chat-offline-indicator/component';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import { useMutation } from '@apollo/client';
import { CHAT_SEND_MESSAGE, CHAT_SET_TYPING } from './mutations';
import Storage from '/imports/ui/services/storage/session';
import { indexOf, without } from '/imports/utils/array-utils';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { throttle } from '/imports/utils/throttle';

// @ts-ignore - temporary, while meteor exists in the project
const CHAT_CONFIG = Meteor.settings.public.chat;

const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
const CLOSED_CHAT_LIST_KEY = 'closedChatList';
const START_TYPING_THROTTLE_INTERVAL = 1000;

interface ChatMessageFormProps {
  minMessageLength: number,
  maxMessageLength: number,
  // Lint disable here because this variable can be undefined
  // eslint-disable-next-line react/no-unused-prop-types
  idChatOpen: string,
  chatId: string,
  connected: boolean,
  disabled: boolean,
  locked: boolean,
  partnerIsLoggedOut: boolean,
  title: string,
  handleClickOutside: () => void,
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

// @ts-ignore - temporary, while meteor exists in the project
const AUTO_CONVERT_EMOJI = Meteor.settings.public.chat.autoConvertEmoji;
// @ts-ignore - temporary, while meteor exists in the project
const ENABLE_EMOJI_PICKER = Meteor.settings.public.chat.emojiPicker.enable;
const ENABLE_TYPING_INDICATOR = CHAT_CONFIG.typingIndicator.enabled;

const ChatMessageForm: React.FC<ChatMessageFormProps> = ({
  handleClickOutside,
  title,
  disabled,
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
  const [isTextAreaFocused, setIsTextAreaFocused] = React.useState(false);
  const textAreaRef: RefObject<TextareaAutosize> = useRef<TextareaAutosize>(null);
  const { isMobile } = deviceInfo;
  const prevChatId = usePreviousValue(chatId);
  const messageRef = useRef<string>('');
  messageRef.current = message;
  const updateUnreadMessages = (chatId: string, message: string) => {
    const storedData = localStorage.getItem('unsentMessages') || '{}';
    const unsentMessages = JSON.parse(storedData);
    unsentMessages[chatId] = message;
    localStorage.setItem('unsentMessages', JSON.stringify(unsentMessages));
  };

  const [chatSetTyping] = useMutation(CHAT_SET_TYPING);

  const [chatSendMessage, {
    loading: chatSendMessageLoading, error: chatSendMessageError,
  }] = useMutation(CHAT_SEND_MESSAGE);

  const handleUserTyping = throttle(
    (hasError?: boolean) => {
      if (hasError || !ENABLE_TYPING_INDICATOR) return;

      chatSetTyping({
        variables: {
          chatId: chatId === PUBLIC_CHAT_ID ? PUBLIC_GROUP_CHAT_ID : chatId,
        },
      });
    },
    START_TYPING_THROTTLE_INTERVAL,
    { leading: true, trailing: false },
  );

  useEffect(() => {
    setMessageHint();
    if (!isMobile) {
      if (textAreaRef?.current) textAreaRef.current.textarea.focus();
    }

    return () => {
      const unsentMessage = messageRef.current;
      updateUnreadMessages(chatId, unsentMessage);
    };
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

  useEffect(() => {
    const shouldRestoreFocus = textAreaRef.current
      && !chatSendMessageLoading
      && isTextAreaFocused
      && document.activeElement !== textAreaRef.current.textarea;

    if (shouldRestoreFocus) {
      textAreaRef.current.textarea.focus();
    }
  }, [chatSendMessageLoading, textAreaRef.current]);

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
  };

  const handleEmojiSelect = (emojiObject: { native: string }): void => {
    const txtArea = textAreaRef?.current?.textarea;
    if (!txtArea) return;
    const cursor = txtArea.selectionStart;

    setMessage(
      message.slice(0, cursor)
      + emojiObject.native
      + message.slice(cursor),
    );

    const newCursor = cursor + emojiObject.native.length;
    setTimeout(() => txtArea.setSelectionRange(newCursor, newCursor), 10);
  };

  const handleMessageChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
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

    window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormEventsNames.CHAT_INPUT_TEXT_CHANGED, {
      detail: {
        text: newMessage,
      } as ChatFormEventPayloads[PluginSdk.ChatFormEventsNames.CHAT_INPUT_TEXT_CHANGED],
    }));
    setMessage(newMessage);
    setError(newError);
    handleUserTyping(newError != null);
  };

  const renderForm = () => {
    const formRef = useRef<HTMLFormElement | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement> | Event) => {
      e.preventDefault();

      const msg = textToMarkdown(message);

      if (msg.length < minMessageLength) return;

      if (disabled
        || msg.length > maxMessageLength) {
        setHasErrors(true);
        return;
      }

      chatSendMessage({
        variables: {
          chatMessageInMarkdownFormat: msg,
          chatId: chatId === PUBLIC_CHAT_ID ? PUBLIC_GROUP_CHAT_ID : chatId,
        },
      });

      const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);

      // Remove the chat that user send messages from the session.
      if (indexOf(currentClosedChats, chatId) > -1) {
        Storage.setItem(CLOSED_CHAT_LIST_KEY, without(currentClosedChats, chatId));
      }

      setMessage('');
      updateUnreadMessages(chatId, '');
      setHasErrors(false);
      setShowEmojiPicker(false);
      const sentMessageEvent = new CustomEvent(ChatEvents.SENT_MESSAGE);
      window.dispatchEvent(sentMessageEvent);
    };

    const handleMessageKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // TODO Prevent send message pressing enter on mobile and/or virtual keyboard
      if (e.keyCode === 13 && !e.shiftKey) {
        e.preventDefault();

        const event = new Event('submit', {
          bubbles: true,
          cancelable: true,
        });

        handleSubmit(event);
      }
    };
    const handleFillChatFormThroughPlugin = ((
      event: CustomEvent<FillChatFormCommandArguments>,
    ) => setMessage(event.detail.text)) as EventListener;
    useEffect(() => {
      window.addEventListener(ChatFormCommandsEnum.FILL, handleFillChatFormThroughPlugin);
      return () => {
        window.removeEventListener(ChatFormCommandsEnum.FILL, handleFillChatFormThroughPlugin);
      };
    });

    document.addEventListener('click', (event) => {
      const chatList = document.getElementById('chat-list');
      if (chatList?.contains(event.target as Node)) {
        const selection = window.getSelection()?.toString();
        if (selection?.length === 0) {
          textAreaRef.current?.textarea.focus();
        }
      }
    });

    if (chatSendMessageError) { return <div>something went wrong</div>; }

    return (
      <Styled.Form
        ref={formRef}
        onSubmit={handleSubmit}
      >
        {showEmojiPicker ? (
          <Styled.EmojiPickerWrapper>
            <Styled.EmojiPicker
              onEmojiSelect={(emojiObject: { native: string }) => handleEmojiSelect(emojiObject)}
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
            disabled={disabled || partnerIsLoggedOut || chatSendMessageLoading}
            value={message}
            onFocus={() => {
              window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormEventsNames.CHAT_INPUT_FOCUSED));
              setIsTextAreaFocused(true);
            }}
            onBlur={() => {
              window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormEventsNames.CHAT_INPUT_UNFOCUSED));
              setIsTextAreaFocused(false);
            }}
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
            disabled={disabled || partnerIsLoggedOut || chatSendMessageLoading}
            label={intl.formatMessage(messages.submitLabel)}
            color="primary"
            icon="send"
            onClick={() => { }}
            data-test="sendMessageButton"
          />
        </Styled.Wrapper>
        {
          error && (
            <Styled.Error data-test="errorTypingIndicator">
              {error}
            </Styled.Error>
          )
        }

      </Styled.Form>
    );
  };

  return ENABLE_EMOJI_PICKER ? (
    <ClickOutside
      onClick={() => handleClickOutside()}
    >
      {renderForm()}
    </ClickOutside>
  ) : renderForm();
};

// eslint-disable-next-line no-empty-pattern
const ChatMessageFormContainer: React.FC = ({
  // connected, move to network status
}) => {
  const intl = useIntl();
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const idChatOpen: string = layoutSelect((i: Layout) => i.idChatOpen);
  const { data: chat } = useChat((c: Partial<Chat>) => ({
    participant: c?.participant,
    chatId: c?.chatId,
    public: c?.public,
  }), idChatOpen) as GraphqlDataHookSubscriptionResponse<Partial<Chat>>;

  const { data: currentUser } = useCurrentUser((c) => ({
    isModerator: c?.isModerator,
    locked: c?.locked,
  }));

  const title = chat?.participant?.name
    ? intl.formatMessage(messages.titlePrivate, { 0: chat?.participant?.name })
    : intl.formatMessage(messages.titlePublic);

  const { data: meeting } = useMeeting((m) => ({
    lockSettings: m?.lockSettings,
  }));

  const isModerator = currentUser?.isModerator;
  const isPublicChat = chat?.public;
  const isLocked = currentUser?.locked;
  const disablePublicChat = meeting?.lockSettings?.disablePublicChat;
  const disablePrivateChat = meeting?.lockSettings?.disablePrivateChat;

  let locked = false;

  if (!isModerator) {
    if (isPublicChat) {
      locked = (isLocked && disablePublicChat) || false;
    } else {
      locked = (isLocked && disablePrivateChat) || false;
    }
  }

  const handleClickOutside = () => {
    if (showEmojiPicker) {
      setShowEmojiPicker(false);
    }
  };

  if (chat?.participant && !chat.participant.isOnline) {
    return <ChatOfflineIndicator participantName={chat.participant.name} />;
  }

  return (
    <ChatMessageForm
      {...{
        minMessageLength: CHAT_CONFIG.min_message_length,
        maxMessageLength: CHAT_CONFIG.max_message_length,
        idChatOpen,
        handleClickOutside,
        chatId: idChatOpen,
        connected: true, // TODO: monitoring network status
        disabled: locked ?? false,
        title,
        // if participant is not defined, it means that the chat is public
        partnerIsLoggedOut: chat?.participant ? !chat?.participant?.isOnline : false,
        locked: locked ?? false,
      }}
    />
  );
};

export default ChatMessageFormContainer;
