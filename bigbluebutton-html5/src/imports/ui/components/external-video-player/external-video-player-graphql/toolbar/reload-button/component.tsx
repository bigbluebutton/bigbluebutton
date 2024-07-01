import React from 'react';

import Styled from './styles';

interface ReloadButtonProps {
  handleReload: () => void;
  label: string;
}

const ReloadButton: React.FC<ReloadButtonProps> = ({
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

export default ReloadButton;
