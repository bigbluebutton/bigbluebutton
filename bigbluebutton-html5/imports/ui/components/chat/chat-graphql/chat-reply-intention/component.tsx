import React, { useEffect, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import KEYS from '/imports/utils/keys';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import Tooltip from '/imports/ui/components/common/tooltip/container';
import {
  ChatAttachment,
  authenticateUploadedImages,
  getFirstVisibleLineHtml,
  removeAttachmentFromHtml,
} from '/imports/ui/components/chat/chat-graphql/service';
import AttachmentPreview from '/imports/ui/components/chat/chat-graphql/attachment-preview/component';
import Auth from '/imports/ui/services/auth';

const intlMessages = defineMessages({
  cancel: {
    id: 'app.chat.toolbar.reply.cancel',
    description: '',
  },
});

const CANCEL_KEY = 'Esc';

const ChatReplyIntention = () => {
  const [username, setUsername] = useState<string>();
  const [message, setMessage] = useState<string>();
  const [sequence, setSequence] = useState<number>();
  const [attachment, setAttachment] = useState<ChatAttachment | null>(null);
  const intl = useIntl();
  const { animations } = useSettings(SETTINGS.APPLICATION) as {
    animations: boolean;
  };

  const hidden = !username || !message;

  useEffect(() => {
    const handleReplyIntention = (e: Event) => {
      if (e instanceof CustomEvent) {
        setUsername(e.detail.username);
        setMessage(e.detail.message);
        setSequence(e.detail.sequence);
        setAttachment(e.detail.attachment ?? null);
      }
    };

    const handleCancelReplyIntention = (e: Event) => {
      if (e instanceof CustomEvent) {
        setUsername(undefined);
        setMessage(undefined);
        setSequence(undefined);
        setAttachment(null);
      }
    };

    window.addEventListener(ChatEvents.CHAT_REPLY_INTENTION, handleReplyIntention);
    window.addEventListener(ChatEvents.CHAT_CANCEL_REPLY_INTENTION, handleCancelReplyIntention);

    return () => {
      window.removeEventListener(ChatEvents.CHAT_REPLY_INTENTION, handleReplyIntention);
      window.removeEventListener(ChatEvents.CHAT_CANCEL_REPLY_INTENTION, handleCancelReplyIntention);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === KEYS.ESCAPE && !hidden) {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_CANCEL_REPLY_INTENTION),
        );
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [hidden]);

  return (
    <Styled.Container
      data-test="chatReplyIntentionContainer"
      $hidden={hidden}
      $animations={animations}
      onClick={() => {
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, {
            detail: {
              sequence,
            },
          }),
        );
      }}
    >
      <Styled.Message>
        {attachment && <AttachmentPreview attachment={attachment} inline />}
        <Styled.HtmlContent
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{
            __html: authenticateUploadedImages(getFirstVisibleLineHtml(
              attachment ? removeAttachmentFromHtml(message || '', attachment) : message || '',
            )),
          }}
          $currentUserId={Auth.userID as string | undefined}
        />
      </Styled.Message>
      <Tooltip title={intl.formatMessage(intlMessages.cancel, { cancelKey: CANCEL_KEY })}>
        <Styled.CloseBtn
          onClick={(e) => {
            e.stopPropagation();
            window.dispatchEvent(
              new CustomEvent(ChatEvents.CHAT_CANCEL_REPLY_INTENTION),
            );
          }}
          icon="close"
          tabIndex={hidden ? -1 : 0}
          aria-hidden={hidden}
          aria-label={intl.formatMessage(intlMessages.cancel, { cancelKey: CANCEL_KEY })}
          data-test="closeChatReplyIntentionButton"
        />
      </Tooltip>
    </Styled.Container>
  );
};

export default ChatReplyIntention;
