import React from 'react';
import Styled from './styles';

const PadContent = ({
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
      />
    </Styled.Wrapper>
  );
};

export default PadContent;
