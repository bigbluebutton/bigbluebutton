/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, {
  ChangeEvent,
  RefObject,
  useEffect,
  useRef,
  useMemo,
} from 'react';
import TextareaAutosize from 'react-autosize-textarea';
import { ChatFormCommandsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/enums';
import { FillChatFormCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/types';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/consts';
import { ChatFormUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/chat/form/types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { defineMessages, useIntl } from 'react-intl';
import { useIsChatEnabled } from '/imports/ui/services/features';
import { checkText } from 'smile2emoji';
import { findDOMNode } from 'react-dom';

import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
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
import logger from '/imports/startup/client/logger';

const CLOSED_CHAT_LIST_KEY = 'closedChatList';
const START_TYPING_THROTTLE_INTERVAL = 1000;

interface ChatMessageFormProps {
  minMessageLength: number,
  maxMessageLength: number,
  // Lint disable here because this variable can be undefined
  // eslint-disable-next-line react/no-unused-prop-types
  idChatOpen: string,
  isRTL: boolean,
  chatId: string,
  connected: boolean,
  disabled: boolean,
  locked: boolean,
  partnerIsLoggedOut: boolean,
  title: string,
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
  errorOnSendMessage: {
    id: 'app.chat.errorOnSendMessage',
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

const ChatMessageForm: React.FC<ChatMessageFormProps> = ({
  title,
  disabled,
  partnerIsLoggedOut,
  minMessageLength,
  maxMessageLength,
  chatId,
  connected,
  locked,
  isRTL,
}) => {
  const isChatEnabled = useIsChatEnabled();
  if (!isChatEnabled) return null;
  const intl = useIntl();
  const [hasErrors, setHasErrors] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [message, setMessage] = React.useState('');
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiPickerButtonRef = useRef(null);
  const [isTextAreaFocused, setIsTextAreaFocused] = React.useState(false);
  const [repliedMessageId, setRepliedMessageId] = React.useState<string>();
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

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  const AUTO_CONVERT_EMOJI = window.meetingClientSettings.public.chat.autoConvertEmoji;
  const ENABLE_EMOJI_PICKER = window.meetingClientSettings.public.chat.emojiPicker.enable;
  const ENABLE_TYPING_INDICATOR = CHAT_CONFIG.typingIndicator.enabled;

  const handleUserTyping = (hasError?: boolean) => {
    if (hasError || !ENABLE_TYPING_INDICATOR) return;

    chatSetTyping({
      variables: {
        chatId: chatId === PUBLIC_CHAT_ID ? PUBLIC_GROUP_CHAT_ID : chatId,
      },
    });
  };

  const throttleHandleUserTyping = useMemo(() => throttle(
    handleUserTyping, START_TYPING_THROTTLE_INTERVAL, {
      leading: true,
      trailing: false,
    },
  ), [chatId]);

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
    setMessage(newMessage);
    setError(newError);
    throttleHandleUserTyping(newError != null);
  };

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormUiDataNames.CURRENT_CHAT_INPUT_TEXT, {
      detail: {
        text: message,
      },
    }));
  }, [message]);

  useEffect(() => {
    const handler = (e: Event) => {
      if (e instanceof CustomEvent) {
        setRepliedMessageId(e.detail.messageId);
        textAreaRef.current?.textarea.focus();
      }
    };

    window.addEventListener(ChatEvents.CHAT_REPLY_INTENTION, handler);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_REPLY_INTENTION, handler);
    };
  }, []);

  const renderForm = () => {
    const formRef = useRef<HTMLFormElement | null>(null);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement> | Event) => {
      e.preventDefault();

      const msg = textToMarkdown(message);

      if (msg.length < minMessageLength || chatSendMessageLoading) return;

      if (disabled
        || msg.length > maxMessageLength) {
        setHasErrors(true);
        return;
      }

      if (!chatSendMessageLoading) {
        chatSendMessage({
          variables: {
            chatMessageInMarkdownFormat: msg,
            chatId: chatId === PUBLIC_CHAT_ID ? PUBLIC_GROUP_CHAT_ID : chatId,
            replyToMessageId: repliedMessageId,
          },
        });

        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_REPLY_INTENTION, {
            detail: {
              username: undefined,
              message: undefined,
              messageId: undefined,
              chatId: undefined,
            },
          }),
        );
      }
      const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);

      // Remove the chat that user send messages from the session.
      if (indexOf(currentClosedChats, chatId) > -1) {
        Storage.setItem(CLOSED_CHAT_LIST_KEY, without(currentClosedChats, chatId));
      }

      setMessage('');
      updateUnreadMessages(chatId, '');
      setError(null);
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
      // Define functions to first inform ui data hooks that subscribe to these events
      const updateUiDataHookChatFormChangedForPlugin = () => {
        window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED, {
          detail: {
            value: isTextAreaFocused,
          } as ChatFormUiDataPayloads[PluginSdk.ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED],
        }));
      };
      const updateUiDataHookChatInputTextPlugin = () => {
        window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormUiDataNames.CURRENT_CHAT_INPUT_TEXT, {
          detail: {
            text: message,
          } as ChatFormUiDataPayloads[PluginSdk.ChatFormUiDataNames.CURRENT_CHAT_INPUT_TEXT],
        }));
      };

      // When component mount, add event listener to send first information
      // about these ui data hooks to plugin
      window.addEventListener(
        `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED}`,
        updateUiDataHookChatFormChangedForPlugin,
      );
      window.addEventListener(
        `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ChatFormUiDataNames.CURRENT_CHAT_INPUT_TEXT}`,
        updateUiDataHookChatInputTextPlugin,
      );
      window.addEventListener(ChatFormCommandsEnum.FILL, handleFillChatFormThroughPlugin);

      // Before component unmount, remove event listeners for plugin ui data hooks
      return () => {
        window.removeEventListener(
          `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED}`,
          updateUiDataHookChatFormChangedForPlugin,
        );
        window.removeEventListener(
          `${UI_DATA_LISTENER_SUBSCRIBED}-${PluginSdk.ChatFormUiDataNames.CURRENT_CHAT_INPUT_TEXT}`,
          updateUiDataHookChatInputTextPlugin,
        );
        window.removeEventListener(ChatFormCommandsEnum.FILL, handleFillChatFormThroughPlugin);
      };
    }, []);

    document.addEventListener('click', (event) => {
      const chatList = document.getElementById('chat-list');
      if (chatList?.contains(event.target as Node)) {
        const selection = window.getSelection()?.toString();
        if (selection?.length === 0) {
          textAreaRef.current?.textarea.focus();
        }
      }
    });

    useEffect(() => {
      if (chatSendMessageError && error == null) {
        logger.debug('Error on sending chat message: ', chatSendMessageError?.message);
        setError(intl.formatMessage(messages.errorOnSendMessage));
      }
    }, [chatSendMessageError]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        // eslint-disable-next-line react/no-find-dom-node
        const button = findDOMNode(emojiPickerButtonRef.current);
        if (
          (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node))
          && (button && !button.contains(event.target as Node))
        ) {
          setShowEmojiPicker(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, []);

    return (
      <Styled.Form
        ref={formRef}
        onSubmit={handleSubmit}
        isRTL={isRTL}
      >
        {showEmojiPicker ? (
          <Styled.EmojiPickerWrapper ref={emojiPickerRef}>
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
            disabled={disabled || partnerIsLoggedOut}
            value={message}
            onFocus={() => {
              window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED, {
                detail: {
                  value: true,
                },
              }));
              setIsTextAreaFocused(true);
            }}
            onBlur={() => {
              window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED, {
                detail: {
                  value: false,
                },
              }));
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
              ref={emojiPickerButtonRef}
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
            <Styled.ChatMessageError data-test="errorTypingIndicator">
              {error}
            </Styled.ChatMessageError>
          )
        }

      </Styled.Form>
    );
  };

  return renderForm();
};

const ChatMessageFormContainer: React.FC = () => {
  const intl = useIntl();
  const idChatOpen: string = layoutSelect((i: Layout) => i.idChatOpen);
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const { data: chat } = useChat((c: Partial<Chat>) => ({
    participant: c?.participant,
    chatId: c?.chatId,
    public: c?.public,
  }), idChatOpen) as GraphqlDataHookSubscriptionResponse<Partial<Chat>>;

  const { data: currentUser } = useCurrentUser((c) => ({
    isModerator: c?.isModerator,
    userLockSettings: c?.userLockSettings,
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
  const isLocked = currentUser?.locked || currentUser?.userLockSettings?.disablePublicChat;
  const disablePublicChat = meeting?.lockSettings?.disablePublicChat
    || currentUser?.userLockSettings?.disablePublicChat;
  const disablePrivateChat = meeting?.lockSettings?.disablePrivateChat;

  let locked = false;

  if (!isModerator) {
    if (isPublicChat) {
      locked = (isLocked && disablePublicChat) || false;
    } else {
      locked = (isLocked && disablePrivateChat) || false;
    }
  }

  if (chat?.participant && !chat.participant.currentlyInMeeting) {
    return <ChatOfflineIndicator participantName={chat.participant.name} />;
  }

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;

  return (
    <ChatMessageForm
      {...{
        minMessageLength: CHAT_CONFIG.min_message_length,
        maxMessageLength: CHAT_CONFIG.max_message_length,
        idChatOpen,
        chatId: idChatOpen,
        connected: true, // TODO: monitoring network status
        disabled: locked ?? false,
        title,
        isRTL,
        // if participant is not defined, it means that the chat is public
        partnerIsLoggedOut: chat?.participant ? !chat?.participant?.currentlyInMeeting : false,
        locked: locked ?? false,
      }}
    />
  );
};

export default ChatMessageFormContainer;
