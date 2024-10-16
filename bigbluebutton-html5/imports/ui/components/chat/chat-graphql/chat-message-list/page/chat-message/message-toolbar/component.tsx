import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Popover from '@mui/material/Popover';
import { FocusTrap } from '@mui/base/FocusTrap';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Layout } from '/imports/ui/components/layout/layoutTypes';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';
import {
  Container,
  Divider,
  EmojiButton,
  EmojiPicker,
  EmojiPickerWrapper,
  Root,
} from './styles';
import { CHAT_DELETE_MESSAGE_MUTATION } from '../mutations';

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
    id: 'app.chat.toolbar.delete.confimationDescription',
    description: '',
  },
});

interface ChatMessageToolbarProps {
  messageId: string;
  chatId: string;
  username: string;
  own: boolean;
  amIModerator: boolean;
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
}

const ChatMessageToolbar: React.FC<ChatMessageToolbarProps> = (props) => {
  const {
    messageId, chatId, message, username, onEmojiSelected, deleted,
    messageSequence, emphasizedMessage, own, amIModerator, locked,
    onReactionPopoverOpenChange, reactionPopoverIsOpen, hasToolbar, keyboardFocused,
    chatDeleteEnabled, chatEditEnabled, chatReactionsEnabled, chatReplyEnabled,
  } = props;
  const [reactionsAnchor, setReactionsAnchor] = React.useState<Element | null>(
    null,
  );
  const [isTryingToDelete, setIsTryingToDelete] = React.useState(false);
  const intl = useIntl();
  const [chatDeleteMessage] = useMutation(CHAT_DELETE_MESSAGE_MUTATION);

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
  const showDeleteButton = chatDeleteEnabled && (own || amIModerator);
  const showDivider = (showReplyButton || showReactionsButton) && (showEditButton || showDeleteButton);

  return (
    <Root
      $reactionPopoverIsOpen={reactionPopoverIsOpen}
      onKeyDown={(e) => {
        if (e.key === 'Escape' && keyboardFocused) {
          window.dispatchEvent(new CustomEvent(ChatEvents.CHAT_KEYBOARD_FOCUS_MESSAGE_CANCEL));
        }
      }}
    >
      <FocusTrap open={keyboardFocused}>
        <Container className="chat-message-toolbar">
          {showReplyButton && (
            <>
              <EmojiButton
                aria-describedby={`chat-reply-btn-label-${messageSequence}`}
                icon="undo"
                color="light"
                onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                  e.stopPropagation();
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
              <span id={`chat-reply-btn-label-${messageSequence}`} className="sr-only">
                {intl.formatMessage(intlMessages.reply, { 0: messageSequence })}
              </span>
            </>
          )}
          {showReactionsButton && (
            <EmojiButton
              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e.stopPropagation();
                onReactionPopoverOpenChange(true);
              }}
              icon="happy"
              color="light"
              data-test="emojiPickerButton"
              ref={setReactionsAnchor}
            />
          )}
          {showDivider && <Divider role="separator" />}
          {showEditButton && (
            <EmojiButton
              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e.stopPropagation();
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
          )}
          {showDeleteButton && (
            <EmojiButton
              onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
                e.stopPropagation();
                setIsTryingToDelete(true);
              }}
              icon="delete"
              color="light"
              data-test="deleteMessageButton"
            />
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
                  onEmojiSelected(emojiObject);
                }}
                showPreview={false}
                showSkinTones={false}
              />
            </EmojiPickerWrapper>
          </Popover>
          {isTryingToDelete && (
            <ConfirmationModal
              isOpen={isTryingToDelete}
              setIsOpen={setIsTryingToDelete}
              onRequestClose={() => setIsTryingToDelete(false)}
              onConfirm={() => {
                chatDeleteMessage({
                  variables: {
                    chatId,
                    messageId,
                  },
                });
              }}
              title={intl.formatMessage(intlMessages.confirmationTitle)}
              confirmButtonLabel={intl.formatMessage(intlMessages.delete)}
              cancelButtonLabel={intl.formatMessage(intlMessages.cancelLabel)}
              description={intl.formatMessage(intlMessages.confirmationDescription)}
              confirmButtonColor="danger"
              priority="low"
            />
          )}
        </Container>
      </FocusTrap>
    </Root>
  );
};

export default ChatMessageToolbar;
