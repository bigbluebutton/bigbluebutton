import React from 'react';
import Styled from './styles';

const ReloadButtonComponent = ({
  handleReload,
  label,
}) => (
  <Styled.Wrapper>
    <Styled.ReloadButton
      color="primary"
      icon="refresh"
      onClick={handleReload}
      label={label}
      hideLabel
    />
  </Styled.Wrapper>
);

export default ReloadButtonComponent;
