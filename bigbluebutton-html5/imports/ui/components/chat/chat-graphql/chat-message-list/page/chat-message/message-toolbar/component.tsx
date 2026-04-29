import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import {
  Container,
  Divider,
  EmojiButton,
  Root,
} from './styles';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import { useIsPinChatMessageEnabled } from '/imports/ui/services/features';

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
  pinTooltip: {
    id: 'app.chat.header.tooltipPin',
    description: 'pin message tooltip',
    defaultMessage: 'Pin message',
  },
  unpinTooltip: {
    id: 'app.chat.header.tooltipUnpin',
    description: 'unpin message tooltip',
    defaultMessage: 'Unpin message',
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
  isCustomPluginMessage: boolean;
  own: boolean;
  amIModerator: boolean;
  isBreakoutRoom: boolean;
  messageSequence: number;
  onReactionPopoverOpenChange(open: boolean): void;
  reactionPopoverIsOpen: boolean;
  hasToolbar: boolean;
  locked: boolean;
  deleted: boolean;
  isPinned: boolean;
  chatReplyEnabled: boolean;
  chatReactionsEnabled: boolean;
  chatEditEnabled: boolean;
  chatDeleteEnabled: boolean;
  onReply: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onEdit: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onDelete: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  togglePin: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isPublicChat: boolean;
}

const ChatMessageToolbar: React.FC<ChatMessageToolbarProps> = (props) => {
  const {
    isCustomPluginMessage, deleted, isPinned, messageSequence, own, amIModerator, isBreakoutRoom,
    locked, onReactionPopoverOpenChange, reactionPopoverIsOpen, hasToolbar,
    chatDeleteEnabled, chatEditEnabled, chatReactionsEnabled, chatReplyEnabled,
    onDelete, onEdit, onReply, togglePin, isPublicChat,
  } = props;
  const intl = useIntl();
  const chatPinEnabled = useIsPinChatMessageEnabled();
  const SHOW_PIN_MESSAGE_TOOL = window.meetingClientSettings.public.chat.toolbar.includes('pin');

  if ([
    chatReplyEnabled,
    chatReactionsEnabled,
    chatEditEnabled,
    chatDeleteEnabled,
    chatPinEnabled,
  ].every((config) => !config) || !hasToolbar || locked || deleted) return null;

  const showReplyButton = chatReplyEnabled;
  const showReactionsButton = chatReactionsEnabled;
  const showEditButton = chatEditEnabled && own && !isCustomPluginMessage;
  const showDeleteButton = chatDeleteEnabled && (own || (amIModerator && !isBreakoutRoom));
  const showPinMessageButton = chatPinEnabled && SHOW_PIN_MESSAGE_TOOL
    && amIModerator && !isCustomPluginMessage && isPublicChat;
  const showDivider = (showReplyButton || showReactionsButton || showPinMessageButton)
    && (showEditButton || showDeleteButton);

  const container = (
    <Container className="chat-message-toolbar" data-test="chatMessageToolbar">
      {showReplyButton && (
        <>
          <Tooltip title={intl.formatMessage(intlMessages.replyTooltip)}>
            <EmojiButton
              aria-label={intl.formatMessage(intlMessages.reply, { messageSequence })}
              icon="undo"
              color="light"
              onClick={onReply}
              data-test="replyMessageButton"
            />
          </Tooltip>
        </>
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
      {showPinMessageButton && (
        <Tooltip title={intl.formatMessage(isPinned ? intlMessages.unpinTooltip : intlMessages.pinTooltip)}>
          <span>
            <EmojiButton
              aria-label={intl.formatMessage(isPinned ? intlMessages.unpinTooltip : intlMessages.pinTooltip)}
              onClick={togglePin}
              icon={`pin-video_${isPinned ? 'off' : 'on'}`}
              color="light"
              data-test="pinMessageButton"
            />
          </span>
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
