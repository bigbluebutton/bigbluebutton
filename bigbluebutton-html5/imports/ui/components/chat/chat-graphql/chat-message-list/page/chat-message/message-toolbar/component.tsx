import React, { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import {
  Container,
  Divider,
  EmojiButton,
  Root,
} from './styles';
import { CHAT_DELETE_MESSAGE_MUTATION } from '../mutations';
import logger from '/imports/startup/client/logger';
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
  delete: {
    id: 'app.chat.toolbar.delete',
    description: 'delete label',
  },
  cancelLabel: {
    id: 'app.chat.toolbar.delete.cancelLabel',
    description: '',
  },
  confirmationTitle: {
    id: 'app.chat.toolbar.delete.confirmationTitle',
    description: '',
  },
  confirmationDescription: {
    id: 'app.chat.toolbar.delete.confirmationDescription',
    description: '',
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
}

const ChatMessageToolbar: React.FC<ChatMessageToolbarProps> = (props) => {
  const {
    messageId, chatId, message, username, deleted,
    messageSequence, emphasizedMessage, own, amIModerator, isBreakoutRoom, locked,
    onReactionPopoverOpenChange, reactionPopoverIsOpen, hasToolbar, keyboardFocused,
    chatDeleteEnabled, chatEditEnabled, chatReactionsEnabled, chatReplyEnabled, setKeyboardFocused,
  } = props;
  const [isTryingToDelete, setIsTryingToDelete] = React.useState(false);
  const intl = useIntl();
  const [chatDeleteMessage] = useMutation(CHAT_DELETE_MESSAGE_MUTATION);

  const onDeleteConfirmation = useCallback(() => {
    chatDeleteMessage({
      variables: {
        chatId,
        messageId,
      },
    }).catch((e) => {
      logger.error({
        logCode: 'chat_delete_message_error',
        extraInfo: {
          errorName: e?.name,
          errorMessage: e?.message,
        },
      }, `Deleting the message failed: ${e?.message}`);
    });
  }, [chatDeleteMessage, chatId, messageId]);

  const deactivateFocusTrap = () => {
    if (keyboardFocused) {
      setKeyboardFocused(false);
    }
  };

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
      {isTryingToDelete && (
      <ConfirmationModal
        isOpen={isTryingToDelete}
        setIsOpen={setIsTryingToDelete}
        onRequestClose={() => setIsTryingToDelete(false)}
        onConfirm={onDeleteConfirmation}
        title={intl.formatMessage(intlMessages.confirmationTitle)}
        confirmButtonLabel={intl.formatMessage(intlMessages.delete)}
        cancelButtonLabel={intl.formatMessage(intlMessages.cancelLabel)}
        description={intl.formatMessage(intlMessages.confirmationDescription)}
        confirmButtonColor="danger"
        priority="low"
      />
      )}
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
