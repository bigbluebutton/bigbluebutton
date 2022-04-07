import React from 'react';
import Styled from './styles';

const PadContent = ({
  content,
}) => (
  <Styled.Wrapper>
    <Styled.Content>
      <div
        dangerouslySetInnerHTML={{ __html: content }}
        style={{ width: '100%' }}
      />
    </Styled.Content>
  </Styled.Wrapper>
);

export default PadContent;
