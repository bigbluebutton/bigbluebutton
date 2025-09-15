import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';

interface ChatMessagePresentationContentProps {
  metadata: string;
}
interface Metadata {
  fileURI: string;
  filename: string;
}

function assertAsMetadata(metadata: unknown): asserts metadata is Metadata {
  if (typeof metadata !== 'object' || metadata === null) {
    throw new Error('metadata is not an object');
  }
  if (typeof (metadata as Metadata).fileURI !== 'string') {
    throw new Error('metadata.fileURI is not a string');
  }
  if (typeof (metadata as Metadata).filename !== 'string') {
    throw new Error('metadata.fileName is not a string');
  }
}

const intlMessages = defineMessages({
  download: {
    id: 'app.presentation.downloadLabel',
    description: 'used as label for presentation download link',
  },
  withWhiteboardAnnotations: {
    id: 'app.presentationUploader.export.withWhiteboardAnnotations',
    description: 'used for indicating that presentation has annotations',
  },
});

const ChatMessagePresentationContent: React.FC<ChatMessagePresentationContentProps> = ({
  metadata: string,
}) => {
  const intl = useIntl();
  const presentationData = JSON.parse(string) as unknown;
  assertAsMetadata(presentationData);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore - temporary, while meteor exists in the project
  const APP_CONFIG = window.meetingClientSettings.public.app;

  const downloadUrl = `${APP_CONFIG.bbbWebBase}/${presentationData.fileURI}`;
  const parseFilename = (filename = '') => {
    const substrings = filename.split('.');
    substrings.pop();
    const filenameWithoutExtension = substrings.join('');
    return filenameWithoutExtension;
  };
  const parsedFileName = parseFilename(presentationData.filename);

  return (
    <Styled.ChatDowloadContainer data-test="downloadPresentationContainer">
      <span>
        {presentationData.filename}
        &nbsp;
        (
        {intl.formatMessage(intlMessages.withWhiteboardAnnotations)}
        )
      </span>
      <Styled.ChatLink
        href={downloadUrl}
        type="application/pdf"
        rel="noopener, noreferrer"
        download={`${parsedFileName}.pdf`}
        target="_blank"
      >
        {intl.formatMessage(intlMessages.download)}
      </Styled.ChatLink>
    </Styled.ChatDowloadContainer>
  );
};

export default ChatMessagePresentationContent;
