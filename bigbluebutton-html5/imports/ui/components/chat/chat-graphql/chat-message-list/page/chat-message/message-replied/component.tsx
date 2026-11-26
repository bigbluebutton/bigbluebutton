import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import Styled, { DeleteMessage } from './styles';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import {
  ChatAttachment,
  authenticateUploadedImages,
  getFirstVisibleLineHtml,
  removeAttachmentFromHtml,
} from '/imports/ui/components/chat/chat-graphql/service';
import AttachmentPreview from '/imports/ui/components/chat/chat-graphql/attachment-preview/component';

const intlMessages = defineMessages({
  deleteMessage: {
    id: 'app.chat.deleteMessage',
    description: '',
  },
});

interface MessageRepliedProps {
  message: string;
  sequence: number;
  deletedByUser: string | null;
  attachment: ChatAttachment | null;
}

const ChatMessageReplied: React.FC<MessageRepliedProps> = (props) => {
  const {
    message, sequence, deletedByUser, attachment,
  } = props;
  const text = attachment ? removeAttachmentFromHtml(message, attachment) : message;

  const intl = useIntl();

  return (
    <Styled.Container
      data-test="chatMessageReplied"
      onClick={(e) => {
        e.stopPropagation();
        if (e.target instanceof HTMLAnchorElement) {
          return;
        }
        window.dispatchEvent(
          new CustomEvent(ChatEvents.CHAT_FOCUS_MESSAGE_REQUEST, {
            detail: {
              sequence,
            },
          }),
        );
      }}
    >
      {!deletedByUser && (
        <Styled.Message>
          {attachment && <AttachmentPreview attachment={attachment} />}
          <Styled.HtmlContent
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: authenticateUploadedImages(getFirstVisibleLineHtml(text)) }}
            $currentUserId={Auth.userID as string | undefined}
          />
        </Styled.Message>
      )}
      {deletedByUser && (
        <DeleteMessage>
          {intl.formatMessage(intlMessages.deleteMessage, { userName: deletedByUser })}
        </DeleteMessage>
      )}
    </Styled.Container>
  );
};

export default ChatMessageReplied;
