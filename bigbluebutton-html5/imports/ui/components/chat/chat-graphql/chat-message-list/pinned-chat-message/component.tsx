import React, { useState, useMemo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { Message } from '/imports/ui/Types/message';
import { setPinnedChatMessagesHidden } from '/imports/ui/components/chat/chat-graphql/service';
import { CHAT_SET_PINNED_MUTATION } from '/imports/ui/components/chat/chat-graphql/chat-message-list/page/chat-message/mutations';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import ConfirmModal from '/imports/ui/components/common/modal/confirmation/component';
import Styled from './styles';
import { stripTags, unescapeHtml } from '/imports/utils/string-utils';

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
});

interface PinnedMessageComponentProps {
  messages: Message[];
  isModerator: boolean;
}

export default function PinnedMessageComponent({ messages, isModerator }: PinnedMessageComponentProps) {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

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
  const formattedTime = activeMessage?.createdAt ? new Date(activeMessage.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
  const previewText = activeMessage?.message || unescapeHtml(stripTags(activeMessage?.messageAsHtml ?? ''));

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
            <Styled.ToggleButton
              aria-label={intl.formatMessage(intlMessages.unpinMessage)}
              onClick={handleUnpin}
            >
              <Styled.Icon iconName="pin-video_off" />
            </Styled.ToggleButton>
          )}
          <Styled.ToggleButton
            aria-label={intl.formatMessage(intlMessages.hidePinned)}
            onClick={() => setPinnedChatMessagesHidden(true)}
          >
            <Styled.Icon iconName="visibility_off" />
          </Styled.ToggleButton>
        </Styled.Controls>
      </Styled.Header>

      <Styled.MessagePreview
        aria-hidden
        onClick={(e) => handleNavigateToMessage(e)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleNavigateToMessage(e);
          }
        }}
      >
        {previewText}
      </Styled.MessagePreview>
      <Styled.Footer>
        <Styled.FooterUserInfo>
          {activeMessage?.senderName}
          {': '}
          {intl.formatMessage(intlMessages.sentAt)}
          {' '}
          {formattedTime}
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
