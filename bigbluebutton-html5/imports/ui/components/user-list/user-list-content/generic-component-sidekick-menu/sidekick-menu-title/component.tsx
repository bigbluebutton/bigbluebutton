import React from 'react';
import Styled from './styles';

interface SidekickContentMenuTitleProps {
  menuItemTitle: string;
}

const SidekickContentMenuTitle: React.FC<SidekickContentMenuTitleProps> = ({ menuItemTitle }) => {
  return (
    <Styled.Container>
      <Styled.SmallTitle>
        {menuItemTitle}
      </Styled.SmallTitle>
    </Styled.Container>
  );
};

export default SidekickContentMenuTitle;
