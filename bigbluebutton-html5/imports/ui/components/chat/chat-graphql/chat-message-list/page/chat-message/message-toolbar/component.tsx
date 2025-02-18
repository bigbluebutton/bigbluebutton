import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Popover from '@mui/material/Popover';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import {
  Container,
  Divider,
  EmojiButton,
  EmojiPicker,
  EmojiPickerWrapper,
  Root,
} from './styles';

import Tooltip from '/imports/ui/components/common/tooltip/component';

const intlMessages = defineMessages({
  reply: {
    id: 'app.chat.toolbar.reply',
    description: 'reply label',
  },
  edit: {
    id: 'app.chat.toolbar.edit',
    description: 'edit label',
  },
  editTooltip: {
    id: 'app.chat.header.tooltipEdit',
    description: '',
    defaultMessage: 'Edit message',
  },
  replyTooltip: {
    id: 'app.chat.header.tooltipReply',
    description: '',
    defaultMessage: 'Reply to message',
  },
  deleteTooltip: {
    id: 'app.chat.header.tooltipDelete',
    description: '',
    defaultMessage: 'Delete message',
  },
  reactTooltip: {
    id: 'app.chat.header.tooltipReact',
    description: '',
    defaultMessage: 'React to message',
  },
});

interface ChatMessageToolbarProps {
  messageId: string;
  chatId: string;
  username: string;
  own: boolean;
  amIModerator: boolean;
  isBreakoutRoom: boolean;
  message: string;
  messageSequence: number;
  emphasizedMessage: boolean;
  onEmojiSelected(emoji: { id: string; native: string }): void;
  onReactionPopoverOpenChange(open: boolean): void;
  reactionPopoverIsOpen: boolean;
  hasToolbar: boolean;
  locked: boolean;
  deleted: boolean;
  chatReplyEnabled: boolean;
  chatReactionsEnabled: boolean;
  chatEditEnabled: boolean;
  chatDeleteEnabled: boolean;
  keyboardFocused: boolean;
  setKeyboardFocused: React.Dispatch<React.SetStateAction<boolean>>;
  setIsTryingToDelete: React.Dispatch<React.SetStateAction<boolean>>;
}

const ChatMessageToolbar: React.FC<ChatMessageToolbarProps> = (props) => {
  const {
    messageId, chatId, message, username, onEmojiSelected, deleted,
    messageSequence, emphasizedMessage, own, amIModerator, isBreakoutRoom, locked,
    onReactionPopoverOpenChange, reactionPopoverIsOpen, hasToolbar, keyboardFocused,
    chatDeleteEnabled, chatEditEnabled, chatReactionsEnabled, chatReplyEnabled, setKeyboardFocused,
    setIsTryingToDelete,
  } = props;
  const [reactionsAnchor, setReactionsAnchor] = React.useState<Element | null>(
    null,
  );
  const intl = useIntl();

  const isRTL = layoutSelect((i: Layout) => i.isRTL);

  if ([
    chatReplyEnabled,
    chatReactionsEnabled,
    chatEditEnabled,
    chatDeleteEnabled,
  ].every((config) => !config) || !hasToolbar || locked || deleted) return null;

  const showReplyButton = chatReplyEnabled;
  const showReactionsButton = chatReactionsEnabled;
  const showEditButton = chatEditEnabled && own;
  const showDeleteButton = chatDeleteEnabled && (own || (amIModerator && !isBreakoutRoom));
  const showDivider = (showReplyButton || showReactionsButton) && (showEditButton || showDeleteButton);

  const deactivateFocusTrap = () => {
    if (keyboardFocused) {
      setKeyboardFocused(false);
    }
  };

  const container = (
    <Container className="chat-message-toolbar">
      {showReplyButton && (
      <>
        <Tooltip title={intl.formatMessage(intlMessages.replyTooltip)}>
          <EmojiButton
            aria-describedby={`chat-reply-btn-label-${messageSequence}`}
            icon="undo"
            color="light"
            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              e.stopPropagation();
              deactivateFocusTrap();
              window.dispatchEvent(
                new CustomEvent(ChatEvents.CHAT_REPLY_INTENTION, {
                  detail: {
                    username,
                    message,
                    messageId,
                    chatId,
                    emphasizedMessage,
                    sequence: messageSequence,
                  },
                }),
              );
              window.dispatchEvent(
                new CustomEvent(ChatEvents.CHAT_CANCEL_EDIT_REQUEST),
              );
            }}
          />
        </Tooltip>
        <span id={`chat-reply-btn-label-${messageSequence}`} className="sr-only">
          {intl.formatMessage(intlMessages.reply, { 0: messageSequence })}
        </span>
      </>
      )}
      {showReactionsButton && (
      <Tooltip title={intl.formatMessage(intlMessages.reactTooltip)}>
        <EmojiButton
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            onReactionPopoverOpenChange(true);
          }}
          svgIcon="reactions"
          color="light"
          data-test="reactionsPickerButton"
          ref={setReactionsAnchor}
        />
      </Tooltip>
      )}
      {showDivider && <Divider role="separator" />}
      {showEditButton && (
      <Tooltip title={intl.formatMessage(intlMessages.editTooltip)}>
        <EmojiButton
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            deactivateFocusTrap();
            window.dispatchEvent(
              new CustomEvent(ChatEvents.CHAT_EDIT_REQUEST, {
                detail: {
                  messageId,
                  chatId,
                  message,
                },
              }),
            );
            window.dispatchEvent(
              new CustomEvent(ChatEvents.CHAT_CANCEL_REPLY_INTENTION),
            );
          }}
          icon="pen_tool"
          color="light"
          data-test="editMessageButton"
        />
      </Tooltip>
      )}
      {showDeleteButton && (
      <Tooltip title={intl.formatMessage(intlMessages.deleteTooltip)}>
        <EmojiButton
          onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
            e.stopPropagation();
            deactivateFocusTrap();
            setIsTryingToDelete(true);
          }}
          icon="delete"
          color="light"
          data-test="deleteMessageButton"
        />
      </Tooltip>
      )}
      <Popover
        open={reactionPopoverIsOpen}
        anchorEl={reactionsAnchor}
        onClose={() => {
          onReactionPopoverOpenChange(false);
        }}
        anchorOrigin={{
          vertical: 'top',
          horizontal: isRTL ? 'left' : 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: isRTL ? 'right' : 'left',
        }}
      >
        <EmojiPickerWrapper>
          <EmojiPicker
            onEmojiSelect={(emojiObject: { id: string; native: string }) => {
              deactivateFocusTrap();
              onEmojiSelected(emojiObject);
            }}
            showPreview={false}
            showSkinTones={false}
          />
        </EmojiPickerWrapper>
      </Popover>
    </Container>
  );

  return (
    <Root
      $reactionPopoverIsOpen={reactionPopoverIsOpen}
    >
      {container}
    </Root>
  );
};

export default ChatMessageToolbar;
