import React, { useCallback, useState } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Auth from '/imports/ui/services/auth';
import Icon from '/imports/ui/components/common/icon/component';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import {
  ChatAttachment,
  downloadAttachment,
  fileTypeLabel,
  formatFileSize,
  isImageAttachment,
} from '/imports/ui/components/chat/chat-graphql/service';
import ImageLightbox from '../image-lightbox/component';
import Styled from './styles';

const intlMessages = defineMessages({
  openImage: {
    id: 'app.chat.message.attachment.openImage',
    description: 'accessible label of an image sent in the chat, which opens it enlarged',
  },
  fileMeta: {
    id: 'app.chat.message.attachment.fileMeta',
    description: 'size and type of a file sent in the chat, e.g. "6 MB · mp4"',
  },
  download: {
    id: 'app.chat.message.attachment.download',
    description: 'label of the button that downloads a file sent in the chat',
  },
});

// An image narrower than the frame fills its height and leaves bands on the
// sides; a wider one fills its width and leaves bands above and below.
const FRAME_RATIO = 16 / 9;

interface ChatMessageAttachmentContentProps {
  attachment: ChatAttachment;
  // Whether the attachment opens the message box (no replied message above)
  // and closes it (no text below), to follow the box's round corners.
  roundedTop: boolean;
  roundedBottom: boolean;
}

const ChatMessageAttachmentContent: React.FC<ChatMessageAttachmentContentProps> = ({
  attachment,
  roundedTop,
  roundedBottom,
}) => {
  const intl = useIntl();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [wide, setWide] = useState(true);

  const closeLightbox = useCallback(() => setLightboxOpen(false), []);

  if (isImageAttachment(attachment)) {
    const src = Auth.authenticateURL(attachment.url);
    return (
      <>
        <Styled.ImageFrame
          type="button"
          $roundedTop={roundedTop}
          $roundedBottom={roundedBottom}
          $ratio={FRAME_RATIO}
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          aria-label={intl.formatMessage(intlMessages.openImage, { fileName: attachment.name })}
          data-test="chatAttachmentImageButton"
        >
          <Styled.Image
            src={src}
            alt={attachment.name}
            $wide={wide}
            onLoad={(e) => {
              const { naturalWidth, naturalHeight } = e.currentTarget;
              if (naturalHeight > 0) setWide(naturalWidth / naturalHeight >= FRAME_RATIO);
            }}
            data-test="chatAttachmentImage"
          />
        </Styled.ImageFrame>
        {lightboxOpen && <ImageLightbox src={src} alt={attachment.name} onClose={closeLightbox} />}
      </>
    );
  }

  const downloadLabel = intl.formatMessage(intlMessages.download, { fileName: attachment.name });
  return (
    <Styled.FileRow $roundedTop={roundedTop} $roundedBottom={roundedBottom} data-test="chatAttachmentFile">
      <Styled.FileIcon aria-hidden="true">
        <InsertDriveFileIcon fontSize="inherit" />
      </Styled.FileIcon>
      <Styled.FileName title={attachment.name} data-test="chatAttachmentFileName">
        {attachment.name}
      </Styled.FileName>
      <Styled.FileMeta data-test="chatAttachmentFileMeta">
        {intl.formatMessage(intlMessages.fileMeta, {
          size: formatFileSize(intl, attachment.size),
          type: fileTypeLabel(attachment.mime),
        })}
      </Styled.FileMeta>
      <Tooltip title={downloadLabel}>
        <Styled.DownloadButton
          type="button"
          aria-label={downloadLabel}
          onClick={(e) => {
            e.stopPropagation();
            downloadAttachment(attachment);
          }}
          data-test="chatAttachmentDownloadButton"
        >
          <Icon iconName="download" />
        </Styled.DownloadButton>
      </Tooltip>
    </Styled.FileRow>
  );
};

export default ChatMessageAttachmentContent;
