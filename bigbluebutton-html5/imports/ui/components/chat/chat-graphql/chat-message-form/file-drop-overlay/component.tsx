import React from 'react';
import { createPortal } from 'react-dom';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import { fileTypeLabel, formatFileSize } from '../attachments/service';

const intlMessages = defineMessages({
  title: {
    id: 'app.chat.fileDrop.title',
    description: 'shown over the chat panel while files are dragged over it',
  },
  supportedTypes: {
    id: 'app.chat.fileDrop.supportedTypes',
    description: 'list of the file types that can be sent in the chat',
  },
  maxSize: {
    id: 'app.chat.fileDrop.maxSize',
    description: 'largest file that can be sent in the chat',
  },
});

interface FileDropOverlayProps {
  host: HTMLElement;
}

// The limits come from the meeting settings (public.fileUpload), the same ones
// the upload checks against, so what the overlay promises is what is accepted.
const FileDropOverlay: React.FC<FileDropOverlayProps> = ({ host }) => {
  const intl = useIntl();
  const { allowedMimeTypes, maxFileSizeKb } = window.meetingClientSettings.public.fileUpload;
  const types = Array.from(new Set(allowedMimeTypes.map(fileTypeLabel)));

  return createPortal(
    <Styled.Overlay data-test="chatFileDropOverlay">
      <Styled.Title>{intl.formatMessage(intlMessages.title)}</Styled.Title>
      <Styled.Detail>
        {intl.formatMessage(intlMessages.supportedTypes, {
          types: intl.formatList(types, { type: 'unit' }),
        })}
      </Styled.Detail>
      <Styled.Detail>
        {intl.formatMessage(intlMessages.maxSize, { size: formatFileSize(intl, maxFileSizeKb * 1024) })}
      </Styled.Detail>
    </Styled.Overlay>,
    host,
  );
};

export default FileDropOverlay;
