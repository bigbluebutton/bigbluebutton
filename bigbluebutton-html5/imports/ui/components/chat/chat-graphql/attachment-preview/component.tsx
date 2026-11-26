import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import { ChatAttachment, isImageAttachment } from '../service';
import Styled from './styles';

const intlMessages = defineMessages({
  attachedFile: {
    id: 'app.chat.message.attachment.previewLabel',
    description: 'stands for the file of a message in the reply and pinned message previews',
  },
});

interface AttachmentPreviewProps {
  attachment: ChatAttachment;
  // On the single line of the reply being written, next to the text.
  inline?: boolean;
}

// How a message's attachment shows where the message is only quoted (the
// replied message, the reply being written, the pinned message): a thumbnail
// for an image, a label for any other file.
const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachment, inline = false }) => {
  const intl = useIntl();

  if (isImageAttachment(attachment)) {
    return (
      <Styled.Thumbnail
        src={Auth.authenticateURL(attachment.url)}
        alt={attachment.name}
        $inline={inline}
        data-test="attachmentPreviewThumbnail"
      />
    );
  }

  return (
    <Styled.Label data-test="attachmentPreviewLabel">
      {intl.formatMessage(intlMessages.attachedFile)}
    </Styled.Label>
  );
};

export default AttachmentPreview;
