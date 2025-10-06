import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Container,
  Divider,
  EmojiButton,
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
  own: boolean;
  amIModerator: boolean;
  isBreakoutRoom: boolean;
  messageSequence: number;
  onReactionPopoverOpenChange(open: boolean): void;
  reactionPopoverIsOpen: boolean;
  hasToolbar: boolean;
  locked: boolean;
  deleted: boolean;
  chatReplyEnabled: boolean;
  chatReactionsEnabled: boolean;
  chatEditEnabled: boolean;
  chatDeleteEnabled: boolean;
  onReply: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onEdit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDelete: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

const ChatMessageToolbar: React.FC<ChatMessageToolbarProps> = (props) => {
  const {
    deleted, messageSequence, own, amIModerator, isBreakoutRoom,
    locked, onReactionPopoverOpenChange, reactionPopoverIsOpen, hasToolbar,
    chatDeleteEnabled, chatEditEnabled, chatReactionsEnabled, chatReplyEnabled,
    onDelete, onEdit, onReply,
  } = props;
  const intl = useIntl();

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
    <Container className="chat-message-toolbar" data-test="chatMessageToolbar">
      {showReplyButton && (
        <Tooltip title={intl.formatMessage(intlMessages.replyTooltip)}>
          <EmojiButton
            aria-label={intl.formatMessage(intlMessages.reply, { messageSequence })}
            icon="undo"
            color="light"
            onClick={onReply}
            data-test="replyMessageButton"
          />
        </Tooltip>
      )}
      {showReactionsButton && (
        <Tooltip title={intl.formatMessage(intlMessages.reactTooltip)}>
          <EmojiButton
            aria-label={intl.formatMessage(intlMessages.reactTooltip)}
            onClick={(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
              e.stopPropagation();
              onReactionPopoverOpenChange(true);
            }}
            svgIcon="reactions"
            color="light"
            data-test="reactMessageButton"
          />
        </Tooltip>
      )}
      {showDivider && <Divider role="separator" />}
      {showEditButton && (
        <Tooltip title={intl.formatMessage(intlMessages.editTooltip)}>
          <EmojiButton
            aria-label={intl.formatMessage(intlMessages.editTooltip)}
            onClick={onEdit}
            icon="pen_tool"
            color="light"
            data-test="editMessageButton"
          />
        </Tooltip>
      )}
      {showDeleteButton && (
        <Tooltip title={intl.formatMessage(intlMessages.deleteTooltip)}>
          <EmojiButton
            aria-label={intl.formatMessage(intlMessages.deleteTooltip)}
            onClick={onDelete}
            icon="delete"
            color="light"
            data-test="deleteMessageButton"
          />
        </Tooltip>
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
