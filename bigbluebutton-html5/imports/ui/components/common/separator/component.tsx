import React from 'react';
import { SeparatorProps } from './types';
import Styled from './styles';

const Separator = ({ icon = '', actionsBar = false, dataTest = '' }: SeparatorProps) => {
  if (!icon) return (<Styled.Separator actionsBar={actionsBar} data-test={dataTest} />);
  return (<Styled.IconContainer data-test={dataTest}><Styled.Icon iconName={icon} /></Styled.IconContainer>);
};

export default Separator;
