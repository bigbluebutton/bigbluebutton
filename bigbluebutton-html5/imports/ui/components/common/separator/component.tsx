import React from 'react';
import { SeparatorProps } from './types';
import Styled from './styles';

const Separator = ({ icon = '', actionsBar = false }: SeparatorProps) => {
  if (!icon) return (<Styled.Separator actionsBar={actionsBar} />);
  return (<Styled.IconContainer><Styled.Icon iconName={icon} /></Styled.IconContainer>);
};

export default Separator;
