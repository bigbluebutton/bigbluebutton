import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Styled from './styles';
import Icon from '/imports/ui/components/common/icon/component';
import getPresentationDownloadData from './service';

interface ChatMessagePresentationContentProps {
  metadata: string;
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
  const { downloadUrl, filename } = getPresentationDownloadData(string);
  const parseFilename = (filename = '') => {
    const substrings = filename.split('.');
    substrings.pop();
    const filenameWithoutExtension = substrings.join('');
    return filenameWithoutExtension;
  };
  const parsedFileName = parseFilename(filename);

  return (
    <Styled.ContentWrapper data-test="downloadPresentationContainer">
      <Styled.IconWrapper>
        <Icon iconName="download" />
      </Styled.IconWrapper>

      <Styled.TextWrapper>
        <span>{filename}</span>
        <Styled.AnnotationText>
          {intl.formatMessage(intlMessages.withWhiteboardAnnotations)}
        </Styled.AnnotationText>
      </Styled.TextWrapper>

      <Styled.DownloadLink
        href={downloadUrl}
        type="application/pdf"
        rel="noopener, noreferrer"
        download={`${parsedFileName}.pdf`}
        target="_blank"
      >
        {intl.formatMessage(intlMessages.download)}
      </Styled.DownloadLink>
    </Styled.ContentWrapper>
  );
};

export default ChatMessagePresentationContent;
