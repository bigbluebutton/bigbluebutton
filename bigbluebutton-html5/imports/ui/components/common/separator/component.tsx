import React, { ReactNode } from 'react';
import { SeparatorProps } from './types';
import Styled from './styles';
import PluginButtonIcon from '../../plugins/plugin-icon/styles';

const Separator = ({ icon, actionsBar = false, dataTest = '' }: SeparatorProps) => {
  if (!icon) return (<Styled.Separator actionsBar={actionsBar} data-test={dataTest} />);
  if (typeof icon === 'object' && 'svgContent' in icon) {
    return (
      <Styled.IconContainer data-test={dataTest}>
        <PluginButtonIcon>{icon.svgContent as ReactNode}</PluginButtonIcon>
      </Styled.IconContainer>
    );
  }
  const iconName = typeof icon === 'string' ? icon : icon.iconName;
  return (
    <Styled.IconContainer data-test={dataTest}>
      <Styled.Icon iconName={iconName} />
    </Styled.IconContainer>
  );
};

export default Separator;
