import React, { useEffect, useState } from 'react';
import { patch } from '@mconf/bbb-diff';
import Styled from './styles';
import { GET_PAD_CONTENT_DIFF_STREAM, GetPadContentDiffStreamResponse } from './queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

interface PadContentProps {
  content: string;
}

interface PadContentContainerProps {
  externalId: string;
}

const PadContent: React.FC<PadContentProps> = ({
  content,
}) => {
  const contentSplit = content.split('<body>');
  const contentStyle = `
  <body>
  <style type="text/css">
    body {
      ${Styled.contentText}
    }
  </style>
  `;
  const contentWithStyle = [contentSplit[0], contentStyle, contentSplit[1]].join('');
  return (
    <Styled.Wrapper>
      <Styled.Iframe
        title="shared notes viewing mode"
        srcDoc={contentWithStyle}
        data-test="sharedNotesViewingMode"
      />
    </Styled.Wrapper>
  );
};

const PadContentContainer: React.FC<PadContentContainerProps> = ({ externalId }) => {
  const [content, setContent] = useState('');
  const { data: contentDiffData } = useDeduplicatedSubscription<GetPadContentDiffStreamResponse>(
    GET_PAD_CONTENT_DIFF_STREAM,
    { variables: { externalId } },
  );

  useEffect(() => {
    if (!contentDiffData) return;
    const patches = contentDiffData.sharedNotes_diff_stream;
    const patchedContent = patches.reduce((currentContent, attribs) => patch(
      currentContent,
      { start: attribs.start, end: attribs.end, text: attribs.diff },
    ), content);
    setContent(patchedContent);
  }, [contentDiffData]);

  return (
    <PadContent content={content} />
  );
};

export default PadContentContainer;
