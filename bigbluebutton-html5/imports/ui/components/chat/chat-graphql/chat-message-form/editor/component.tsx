import React, {
  useEffect,
  useRef,
  useMemo,
} from 'react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Image from '@tiptap/extension-image';
import Showdown from 'showdown';
import Turndown from 'turndown';
import { useMutation } from '@apollo/client';
import { ChatFormCommandsEnum } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/enums';
import { FillChatFormCommandArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-commands/chat/form/types';
import { UI_DATA_LISTENER_SUBSCRIBED } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/consts';
import { ChatFormUiDataPayloads } from 'bigbluebutton-html-plugin-sdk/dist/cjs/ui-data-hooks/chat/form/types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { defineMessages, useIntl } from 'react-intl';
import { useIsChatEnabled } from '/imports/ui/services/features';
import deviceInfo from '/imports/utils/deviceInfo';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import { CHAT_SEND_MESSAGE, CHAT_SET_TYPING } from '../mutations';
import Storage from '/imports/ui/services/storage/session';
import { indexOf, without } from '/imports/utils/array-utils';
import { throttle } from '/imports/utils/throttle';
import logger from '/imports/startup/client/logger';
import { CHAT_EDIT_MESSAGE_MUTATION } from '../../chat-message-list/page/chat-message/mutations';
import SvgIcon from '/imports/ui/components/common/icon-svg/component';
import Icon from '/imports/ui/components/common/icon/icon-ts/component';
import Styled from './styles';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import FileHandler from './extensions/FileHandler';
import { MIME_TYPES_ALLOWED, readFileAsDataURL, uploadImage } from '../service';

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
  bold: {
    id: 'app.chat.editor.bold',
    description: 'editor bold tool',
  },
  italic: {
    id: 'app.chat.editor.italic',
    description: 'editor italic tool',
  },
  bulletList: {
    id: 'app.chat.editor.bulletList',
    description: 'editor bullet list tool',
  },
  orderedList: {
    id: 'app.chat.editor.orderedList',
    description: 'editor ordered list tool',
  },
  code: {
    id: 'app.chat.editor.code',
    description: 'editor code tool',
  },
  codeBlock: {
    id: 'app.chat.editor.codeBlock',
    description: 'editor code block tool',
  },
  clear: {
    id: 'app.chat.editor.clear',
    description: 'editor clear button',
  },
});

const CLOSED_CHAT_LIST_KEY = 'closedChatList';
const START_TYPING_THROTTLE_INTERVAL = 1000;

const showdownConverter = new Showdown.Converter();
const turndownConverter = new Turndown();

type EditingMessage = { chatId: string; messageId: string, message: string };

interface ChatRichTextEditorProps {
  minMessageLength: number;
  maxMessageLength: number;
  isRTL: boolean;
  chatId: string;
  connected: boolean;
  disabled: boolean;
  locked: boolean;
  partnerIsLoggedOut: boolean;
  title: string;
}

const ChatRichTextEditor: React.FC<ChatRichTextEditorProps> = (props) => {
  const {
    chatId,
    connected,
    disabled,
    isRTL,
    locked,
    maxMessageLength,
    minMessageLength,
    partnerIsLoggedOut,
    title,
  } = props;

  const isChatEnabled = useIsChatEnabled();
  if (!isChatEnabled) return null;
  const intl = useIntl();
  const [hasErrors, setHasErrors] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showEmojiPicker, setShowEmojiPicker] = React.useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const emojiPickerButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isTextAreaFocused, setIsTextAreaFocused] = React.useState(false);
  const [repliedMessageId, setRepliedMessageId] = React.useState<string | null>(null);
  const editingMessage = React.useRef<EditingMessage | null>(null);
  const { isMobile } = deviceInfo;
  const prevChatId = usePreviousValue(chatId);
  const messageRef = useRef<string>('');
  const messageBeforeEditingRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const updateUnsentMessages = (chatId: string, message: string) => {
    const storedData = localStorage.getItem('unsentMessages') || '{}';
    const unsentMessages = JSON.parse(storedData);
    unsentMessages[chatId] = message;
    localStorage.setItem('unsentMessages', JSON.stringify(unsentMessages));
  };

  const [chatSetTyping] = useMutation(CHAT_SET_TYPING);

  const [chatSendMessage, {
    loading: chatSendMessageLoading, error: chatSendMessageError,
  }] = useMutation(CHAT_SEND_MESSAGE);
  const [
    chatEditMessage,
    { loading: chatEditMessageLoading },
  ] = useMutation(CHAT_EDIT_MESSAGE_MUTATION);

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;
  // TODO Make the editor respect this config
  // const AUTO_CONVERT_EMOJI = window.meetingClientSettings.public.chat.autoConvertEmoji;
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

  const editor = useEditor({
    extensions: [
      StarterKit,
      Image.configure({ allowBase64: true }),
      FileHandler,
      Placeholder.configure({
        placeholder: intl.formatMessage(messages.inputPlaceholder, { 0: title }),
      }),
    ],
    onUpdate({ editor }) {
      const contentInMarkdown = turndownConverter.turndown(editor.getHTML());
      throttleHandleUserTyping();
      messageRef.current = contentInMarkdown;

      window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormUiDataNames.CURRENT_CHAT_INPUT_TEXT, {
        detail: {
          text: contentInMarkdown,
        },
      }));
    },
    onBlur() {
      window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED, {
        detail: {
          value: false,
        },
      }));
    },
    onFocus() {
      window.dispatchEvent(new CustomEvent(PluginSdk.ChatFormUiDataNames.CHAT_INPUT_IS_FOCUSED, {
        detail: {
          value: true,
        },
      }));
      setIsTextAreaFocused(true);
    },
  });

  useEffect(() => {
    setMessageHint();
    if (!isMobile) {
      if (editor) editor.commands.focus();
    }

    return () => {
      const unsentMessage = messageRef.current;
      updateUnsentMessages(chatId, unsentMessage);
    };
  }, []);

  useEffect(() => {
    const storedData = localStorage.getItem('unsentMessages') || '{}';
    const unsentMessages = JSON.parse(storedData);
    const message = editor ? turndownConverter.turndown(editor.getHTML()) : '';

    if (prevChatId) {
      updateUnsentMessages(prevChatId, message);
    }

    const unsentMessage = unsentMessages[chatId] || '';
    editor?.commands.setContent(unsentMessage);

    if (!isMobile) {
      if (editor) editor.commands.focus();
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
  };

  const handleEmojiSelect = (emojiObject: { native: string }): void => {
    if (!editor) return;
    editor.chain().insertContent(emojiObject.native).focus().run();
  };

  useEffect(() => {
    const handleReplyIntention = (e: Event) => {
      if (e instanceof CustomEvent) {
        setRepliedMessageId(e.detail.messageId);
        editor?.commands.focus();
      }
    };

    const handleEditingMessage = (e: Event) => {
      if (e instanceof CustomEvent) {
        if (messageBeforeEditingRef.current === null) {
          messageBeforeEditingRef.current = messageRef.current;
        }
        editor?.commands.setContent(showdownConverter.makeHtml(e.detail.message));
        editor?.commands.focus();
        editingMessage.current = e.detail;
      }
    };

    const handleCancelEditingMessage = (e: Event) => {
      if (e instanceof CustomEvent) {
        if (editingMessage.current) {
          if (messageBeforeEditingRef.current !== null) {
            editor?.commands.setContent(showdownConverter.makeHtml(messageBeforeEditingRef.current));
            messageBeforeEditingRef.current = null;
          }
          editingMessage.current = null;
        }
      }
    };

    const handleCancelReplyIntention = (e: Event) => {
      if (e instanceof CustomEvent) {
        setRepliedMessageId(null);
      }
    };

    window.addEventListener(ChatEvents.CHAT_REPLY_INTENTION, handleReplyIntention);
    window.addEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleEditingMessage);
    window.addEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelEditingMessage);
    window.addEventListener(ChatEvents.CHAT_CANCEL_REPLY_INTENTION, handleCancelReplyIntention);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_REPLY_INTENTION, handleReplyIntention);
      window.removeEventListener(ChatEvents.CHAT_EDIT_REQUEST, handleEditingMessage);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_EDIT_REQUEST, handleCancelEditingMessage);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_REPLY_INTENTION, handleCancelReplyIntention);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement> | React.KeyboardEvent<HTMLInputElement> | Event) => {
    e.preventDefault();

    const contentInMarkdown = editor ? turndownConverter.turndown(editor.getHTML()) : '';

    if (contentInMarkdown.length < minMessageLength || chatSendMessageLoading) return;

    if (disabled
      || contentInMarkdown.length > maxMessageLength) {
      setHasErrors(true);
      return;
    }

    const sendCancelEvents = () => {
      if (repliedMessageId) {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_CANCEL_REPLY_INTENTION),
        );
      }
      if (editingMessage) {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_CANCEL_EDIT_REQUEST),
        );
      }
    };

    if (editingMessage.current && !chatEditMessageLoading) {
      chatEditMessage({
        variables: {
          chatId: editingMessage.current.chatId,
          messageId: editingMessage.current.messageId,
          chatMessageInMarkdownFormat: contentInMarkdown,
        },
      }).then(() => {
        sendCancelEvents();
      }).catch((e) => {
        logger.error({
          logCode: 'chat_edit_message_error',
          extraInfo: {
            errorName: e?.name,
            errorMessage: e?.message,
          },
        }, `Editing the message failed: ${e?.message}`);
      });
    } else if (!chatSendMessageLoading) {
      chatSendMessage({
        variables: {
          chatMessageInMarkdownFormat: contentInMarkdown,
          chatId: chatId === PUBLIC_CHAT_ID ? PUBLIC_GROUP_CHAT_ID : chatId,
          replyToMessageId: repliedMessageId,
        },
      }).then(() => {
        sendCancelEvents();
      });
    }
    const currentClosedChats = Storage.getItem(CLOSED_CHAT_LIST_KEY);

    // Remove the chat that user send messages from the session.
    if (indexOf(currentClosedChats, chatId) > -1) {
      Storage.setItem(CLOSED_CHAT_LIST_KEY, without(currentClosedChats, chatId));
    }

    editor?.commands.setContent('');
    updateUnsentMessages(chatId, '');
    setError(null);
    setHasErrors(false);
    setShowEmojiPicker(false);
    const sentMessageEvent = new CustomEvent(ChatEvents.SENT_MESSAGE);
    window.dispatchEvent(sentMessageEvent);
  };

  const handleFillChatFormThroughPlugin = ((
    event: CustomEvent<FillChatFormCommandArguments>,
  ) => editor?.commands.setContent(showdownConverter.makeHtml(event.detail.text))) as EventListener;
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
          text: editor ? turndownConverter.turndown(editor.getHTML()) : '',
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

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const chatList = document.getElementById('chat-list');
      if (chatList?.contains(event.target as Node)) {
        const selection = window.getSelection()?.toString();
        if (selection?.length === 0) {
          editor?.commands.focus();
        }
      }
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, []);

  useEffect(() => {
    if (chatSendMessageError && error == null) {
      logger.debug('Error on sending chat message: ', chatSendMessageError?.message);
      setError(intl.formatMessage(messages.errorOnSendMessage));
    }
  }, [chatSendMessageError]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const button = emojiPickerButtonRef.current;
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

  const commands = editor && [
    {
      label: intl.formatMessage(messages.bold),
      icon: 'bold',
      id: 'chat-editor-bold-tool',
      command: () => editor.chain().focus().toggleBold().run(),
      active: editor.isActive('bold'),
      disabled: !editor.can()
        .chain()
        .focus()
        .toggleBold()
        .run(),
    },
    {
      label: intl.formatMessage(messages.italic),
      icon: 'italic',
      id: 'chat-editor-italic-tool',
      command: () => editor.chain().focus().toggleItalic().run(),
      active: editor.isActive('italic'),
      disabled: !editor.can()
        .chain()
        .focus()
        .toggleItalic()
        .run(),
    },
    { divider: true },
    {
      label: intl.formatMessage(messages.bulletList),
      icon: 'bulletList',
      id: 'chat-editor-bullet-list-tool',
      command: () => editor.chain().focus().toggleBulletList().run(),
      active: editor.isActive('bulletList'),
      disabled: !editor.can()
        .chain()
        .focus()
        .toggleBulletList()
        .run(),
    },
    {
      label: intl.formatMessage(messages.orderedList),
      icon: 'numberedList',
      id: 'chat-editor-ordered-list-tool',
      command: () => editor.chain().focus().toggleOrderedList().run(),
      active: editor.isActive('orderedList'),
      disabled: !editor.can()
        .chain()
        .focus()
        .toggleOrderedList()
        .run(),
    },
    { divider: true },
    {
      label: intl.formatMessage(messages.code),
      icon: 'codeBracket',
      id: 'chat-editor-code-tool',
      command: () => editor.chain().focus().toggleCode().run(),
      active: editor.isActive('code'),
      disabled: !editor.can()
        .chain()
        .focus()
        .toggleCode()
        .run(),
    },
    {
      label: intl.formatMessage(messages.codeBlock),
      icon: 'codeBracketSquare',
      id: 'chat-editor-code-block-tool',
      command: () => editor.chain().focus().toggleCodeBlock().run(),
      active: editor.isActive('codeBlock'),
      disabled: !editor.can()
        .chain()
        .focus()
        .toggleCodeBlock()
        .run(),
    },
    { divider: true },
    {
      label: 'Image',
      icon: 'photo',
      id: 'chat-editor-image-tool',
      command: () => fileInputRef.current?.click(),
      active: editor.isActive('image'),
      disabled: false,
    },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    readFileAsDataURL(file, (e) => {
      const data = e.target?.result;
      if (!data || typeof data !== 'string') return;
      uploadImage(data).then((url) => {
        editor?.chain().focus().setImage({ src: url, title: file.name }).run();
      });
    }, (error) => {
      logger.error({
        logCode: 'file_reading_error',
        extraInfo: {
          errorName: error?.name,
          errorMessage: error?.message,
        },
      }, `File reading error: ${error?.message}`);
    });
  };

  if (!editor) return null;

  return (
    <Styled.Form onSubmit={handleSubmit} $isRTL={isRTL}>
      <input
        ref={fileInputRef}
        type="file"
        accept={MIME_TYPES_ALLOWED.join(' ,')}
        onChange={handleFileChange}
        hidden
      />
      {showEmojiPicker ? (
        <Styled.EmojiPickerWrapper ref={emojiPickerRef}>
          <Styled.EmojiPicker
            onEmojiSelect={(emojiObject: { native: string }) => handleEmojiSelect(emojiObject)}
            showPreview={false}
            showSkinTones={false}
          />
        </Styled.EmojiPickerWrapper>
      ) : null}
      <Styled.ChatEditorContentWrapper>
        <Styled.ChatEditorContent
          editor={editor}
          id="message-input"
          aria-label={intl.formatMessage(messages.inputLabel, { 0: title })}
          aria-invalid={hasErrors ? 'true' : 'false'}
          autoCorrect="off"
          autoComplete="off"
          spellCheck="true"
          disabled={disabled || partnerIsLoggedOut}
        />
      </Styled.ChatEditorContentWrapper>
      <Styled.Toolbar>
        {ENABLE_EMOJI_PICKER ? (
          <>
            <Tooltip title={intl.formatMessage(messages.emojiButtonLabel)}>
              <Styled.ToolButton
                ref={emojiPickerButtonRef}
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                type="button"
                aria-label={intl.formatMessage(messages.emojiButtonLabel)}
                data-test="emojiPickerButton"
              >
                <SvgIcon iconName="reactions" />
              </Styled.ToolButton>
            </Tooltip>
            <Styled.Divider />
          </>
        ) : null}
        {commands && commands.map((cmd) => {
          if (cmd.divider) {
            return <Styled.Divider />;
          }
          return (
            <React.Fragment key={cmd.id}>
              <Tooltip title={cmd.label}>
                <Styled.ToolButton
                  type="button"
                  data-test="sendMessageButton"
                  onClick={cmd.command}
                  disabled={cmd.disabled}
                  $active={cmd.active}
                  aria-label={cmd.label}
                >
                  {cmd.icon && <SvgIcon iconName={cmd.icon} />}
                </Styled.ToolButton>
              </Tooltip>
            </React.Fragment>
          );
        })}
        <Styled.Controls>
          <Tooltip title={intl.formatMessage(messages.clear)}>
            <Styled.ClearButton
              type="button"
              disabled={editor.isEmpty}
              onClick={() => {
                editor.commands.clearContent();
              }}
            >
              <SvgIcon iconName="xMark" />
            </Styled.ClearButton>
          </Tooltip>
          <Tooltip title={intl.formatMessage(messages.submitLabel)}>
            <Styled.SendButton
              type="submit"
              aria-label={intl.formatMessage(messages.submitLabel)}
              disabled={editor.isEmpty || disabled || partnerIsLoggedOut || chatSendMessageLoading}
            >
              <Icon iconName="send" />
            </Styled.SendButton>
          </Tooltip>
        </Styled.Controls>
      </Styled.Toolbar>
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

export default ChatRichTextEditor;
