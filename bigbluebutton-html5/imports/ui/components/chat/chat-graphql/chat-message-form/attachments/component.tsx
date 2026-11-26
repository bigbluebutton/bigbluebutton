import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import CloseIcon from '@mui/icons-material/Close';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import Tooltip from '@mui/material/Tooltip';
import Styled from './styles';
import { StagedFile } from './service';
import { fileTypeLabel, formatFileSize } from '../../service';

// Past this many files the rest collapse into a "+N" counter; each one shows
// again as the visible ones are removed.
const MAX_VISIBLE_THUMBS = 5;

const intlMessages = defineMessages({
  listLabel: {
    id: 'app.chat.attachments.listLabel',
    description: 'accessible label of the list of files staged to be sent',
  },
  removeFile: {
    id: 'app.chat.attachments.removeFile',
    description: 'label of the button that unstages one file',
  },
  fileMeta: {
    id: 'app.chat.attachments.fileMeta',
    description: 'size and type of the single staged file',
  },
  filesMeta: {
    id: 'app.chat.attachments.filesMeta',
    description: 'number and total size of the staged files',
  },
  moreFiles: {
    id: 'app.chat.attachments.moreFiles',
    description: 'counter of staged files that have no thumbnail on screen',
  },
  moreFilesLabel: {
    id: 'app.chat.attachments.moreFilesLabel',
    description: 'accessible label of the counter of staged files that have no thumbnail on screen',
  },
});

interface ChatAttachmentsProps {
  files: StagedFile[];
  onRemove: (id: string) => void;
  disabled: boolean;
}

const FilePreview: React.FC<{ staged: StagedFile }> = ({ staged }) => (
  staged.previewUrl ? (
    <Styled.Thumb src={staged.previewUrl} alt="" />
  ) : (
    <Styled.FileIcon>
      <InsertDriveFileIcon />
    </Styled.FileIcon>
  )
);

const ChatAttachments: React.FC<ChatAttachmentsProps> = ({ files, onRemove, disabled }) => {
  const intl = useIntl();
  if (files.length === 0) return null;

  const removeLabel = (staged: StagedFile) => intl.formatMessage(
    intlMessages.removeFile,
    { fileName: staged.file.name },
  );

  if (files.length === 1) {
    const [staged] = files;
    return (
      <Styled.Bar data-test="chatAttachments">
        <Styled.ThumbList aria-label={intl.formatMessage(intlMessages.listLabel)}>
          <Styled.ThumbItem data-test="chatAttachment">
            <FilePreview staged={staged} />
          </Styled.ThumbItem>
        </Styled.ThumbList>
        <Styled.FileName title={staged.file.name} data-test="chatAttachmentName">
          {staged.file.name}
        </Styled.FileName>
        <Styled.Meta data-test="chatAttachmentMeta">
          {intl.formatMessage(intlMessages.fileMeta, {
            size: formatFileSize(intl, staged.file.size),
            type: fileTypeLabel(staged.file.type),
          })}
        </Styled.Meta>
        <Tooltip title={removeLabel(staged)}>
          {/* The span keeps the tooltip working while the button is disabled. */}
          <span>
            <Styled.RemoveButton
              type="button"
              onClick={() => onRemove(staged.id)}
              aria-label={removeLabel(staged)}
              data-test="removeChatAttachmentButton"
              disabled={disabled}
            >
              <CloseIcon sx={{ fontSize: '0.875rem' }} />
            </Styled.RemoveButton>
          </span>
        </Tooltip>
      </Styled.Bar>
    );
  }

  const visible = files.slice(0, MAX_VISIBLE_THUMBS);
  const hiddenCount = files.length - visible.length;
  const totalSize = files.reduce((sum, staged) => sum + staged.file.size, 0);

  return (
    <Styled.Bar data-test="chatAttachments">
      <Styled.ThumbList aria-label={intl.formatMessage(intlMessages.listLabel)}>
        {visible.map((staged) => (
          <Styled.ThumbItem key={staged.id} data-test="chatAttachment">
            <Tooltip title={staged.file.name}>
              <span>
                <Styled.ThumbButton
                  type="button"
                  onClick={() => onRemove(staged.id)}
                  aria-label={removeLabel(staged)}
                  data-test="removeChatAttachmentButton"
                  disabled={disabled}
                >
                  <FilePreview staged={staged} />
                  <span data-remove-mark aria-hidden="true">
                    <CloseIcon fontSize="small" />
                  </span>
                </Styled.ThumbButton>
              </span>
            </Tooltip>
          </Styled.ThumbItem>
        ))}
      </Styled.ThumbList>
      {hiddenCount > 0 ? (
        <Styled.MoreCount
          aria-label={intl.formatMessage(intlMessages.moreFilesLabel, { count: hiddenCount })}
          data-test="chatAttachmentsMore"
        >
          {intl.formatMessage(intlMessages.moreFiles, { count: hiddenCount })}
        </Styled.MoreCount>
      ) : null}
      <Styled.Meta data-test="chatAttachmentMeta">
        {intl.formatMessage(intlMessages.filesMeta, {
          count: files.length,
          size: formatFileSize(intl, totalSize),
        })}
      </Styled.Meta>
    </Styled.Bar>
  );
};

export default ChatAttachments;
