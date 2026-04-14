import React, { useState, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { Message } from '/imports/ui/Types/message';
import { setPinnedChatMessagesHidden } from '/imports/ui/components/chat/chat-graphql/service';
import { CHAT_SET_PINNED_MUTATION } from '/imports/ui/components/chat/chat-graphql/chat-message-list/page/chat-message/mutations';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import ConfirmModal from '/imports/ui/components/common/modal/confirmation/component';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import Styled from './styles';

const intlMessages = defineMessages({
  pinnedMessagesTitle: {
    id: 'app.chat.pinnedMessages.title',
    description: 'Pinned messages section title',
  },
  pinnedByLabel: {
    id: 'app.chat.pinnedMessages.pinnedBy',
    description: 'Pinned by label',
  },
  hidePinned: {
    id: 'app.chat.pinnedMessages.hidePinned',
    description: 'Hide pinned messages button label',
  },
  unpinMessage: {
    id: 'app.chat.pinnedMessages.unpin',
    description: 'Unpin message button label',
  },
  sentAt: {
    id: 'app.chat.pinnedMessages.sentAt',
    description: 'Sent at label',
  },
  confirmUnpinTitle: {
    id: 'app.chat.pinnedMessages.confirmModal.unpinTitle',
    description: 'Title for unpin confirmation modal',
  },
  confirmUnpinMessage: {
    id: 'app.chat.pinnedMessages.confirmModal.unpinMessage',
    description: 'Description for unpin confirmation modal',
  },
  confirmButton: {
    id: 'app.chat.pinnedMessages.confirmModal.confirm',
    description: 'Confirm button label for unpin modal',
  },
  cancelButton: {
    id: 'app.chat.pinnedMessages.confirmModal.cancel',
    description: 'Cancel button label for unpin modal',
  },
  unpinTooltip: {
    id: 'app.chat.pinnedMessages.tooltipUnpin',
    description: 'Tooltip for unpin button in pinned messages section',
  },
  hideTooltip: {
    id: 'app.chat.pinnedMessages.tooltipHide',
    description: 'Tooltip for hide button in pinned messages section',
  },
  expandTooltip: {
    id: 'app.chat.pinnedMessages.tooltipExpand',
    description: 'Tooltip for expand button in pinned messages section',
  },
  collapseTooltip: {
    id: 'app.chat.pinnedMessages.tooltipCollapse',
    description: 'Tooltip for collapse button in pinned messages section',
  },
  goToMessage: {
    id: 'app.chat.pinnedMessages.goToMessage',
    description: 'Aria label for navigating to the pinned message',
  },
});

interface PinnedMessageComponentProps {
  messages: Message[];
  isModerator: boolean;
}

export default function PinnedMessageComponent({ messages, isModerator }: PinnedMessageComponentProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const activeMessage = useMemo(() => messages[0] || null, [messages]);
  const intl = useIntl();

  const [unpinMessage] = useMutation(CHAT_SET_PINNED_MUTATION);

  const handleUnpin = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmUnpin = () => {
    if (activeMessage) {
      unpinMessage({
        variables: {
          chatId: activeMessage.chatId,
          messageId: activeMessage.messageId,
          pinned: false,
        },
      });
      setIsConfirmModalOpen(false);
    }
  };

  const dispatchFocusMessage = () => {
    if (activeMessage?.messageSequence) {
      window.dispatchEvent(
        new CustomEvent(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, {
          detail: {
            sequence: activeMessage.messageSequence,
          },
        }),
      );
    }
  };

  const handleNavigateToMessage = (e?: React.MouseEvent | React.KeyboardEvent) => {
    if (!e) {
      dispatchFocusMessage();
      return;
    }

    // Check if the clicked element is a link or inside a link
    let target = e.nativeEvent?.target as HTMLElement | null;
    while (target) {
      if (target.tagName === 'A' || target instanceof HTMLAnchorElement) {
        return;
      }
      target = target.parentElement;
    }

    e.stopPropagation?.();
    dispatchFocusMessage();
  };

  if (!messages || messages.length === 0) return null;

  const pinnedByName = activeMessage?.pinnedBy?.name || '';
  const formattedTime = activeMessage?.createdAt ? intl.formatTime(activeMessage.createdAt) : '';
  const messageAsHtml = activeMessage?.messageAsHtml ?? '';

  return (
    <Styled.Wrapper role="region" aria-label={intl.formatMessage(intlMessages.pinnedMessagesTitle)}>
      <Styled.Header>
        <Styled.Title>
          <Styled.Icon iconName="pin_filled" />
          <Styled.PinnedBy>
            {intl.formatMessage(intlMessages.pinnedByLabel)}
            <Styled.PinnedByName>{pinnedByName}</Styled.PinnedByName>
          </Styled.PinnedBy>
        </Styled.Title>

        <Styled.Controls>
          {isModerator && (
            <Tooltip title={intl.formatMessage(intlMessages.unpinTooltip)}>
              <Styled.ToggleButton
                aria-label={intl.formatMessage(intlMessages.unpinMessage)}
                onClick={handleUnpin}
              >
                <Styled.Icon iconName="pin-video_off" />
              </Styled.ToggleButton>
            </Tooltip>
          )}
          <Tooltip title={intl.formatMessage(intlMessages.hideTooltip)}>
            <Styled.ToggleButton
              aria-label={intl.formatMessage(intlMessages.hidePinned)}
              onClick={() => setPinnedChatMessagesHidden(true)}
            >
              <Styled.Icon iconName="visibility_off" />
            </Styled.ToggleButton>
          </Tooltip>
          <Tooltip title={intl.formatMessage(isExpanded ? intlMessages.collapseTooltip : intlMessages.expandTooltip)}>
            <Styled.ToggleButton
              onClick={() => setIsExpanded((prev) => !prev)}
              aria-label={intl.formatMessage(isExpanded ? intlMessages.collapseTooltip : intlMessages.expandTooltip)}
            >
              <Styled.Icon iconName={isExpanded ? 'arrow_forward_up' : 'arrow_forward_down'} />
            </Styled.ToggleButton>
          </Tooltip>
        </Styled.Controls>
      </Styled.Header>

      <Styled.MessagePreview
        $collapsed={!isExpanded}
        aria-label={intl.formatMessage(intlMessages.goToMessage)}
        onClick={(e) => handleNavigateToMessage(e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleNavigateToMessage(e);
          }
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: messageAsHtml }}
      />
      <Styled.Footer>
        <Styled.FooterUserInfo>
          <Styled.FooterSenderName>
            {activeMessage?.senderName}
          </Styled.FooterSenderName>
          <Styled.FooterTime>
            {intl.formatMessage(intlMessages.sentAt)}
            {' '}
            {formattedTime}
          </Styled.FooterTime>
        </Styled.FooterUserInfo>
      </Styled.Footer>

      {isConfirmModalOpen && (
        <ConfirmModal
          setIsOpen={setIsConfirmModalOpen}
          isOpen={isConfirmModalOpen}
          onConfirm={handleConfirmUnpin}
          title={intl.formatMessage(intlMessages.confirmUnpinTitle)}
          description={intl.formatMessage(intlMessages.confirmUnpinMessage)}
          confirmButtonLabel={intl.formatMessage(intlMessages.confirmButton)}
          cancelButtonLabel={intl.formatMessage(intlMessages.cancelButton)}
          intl={intl}
        />
      )}
    </Styled.Wrapper>
  );
}
