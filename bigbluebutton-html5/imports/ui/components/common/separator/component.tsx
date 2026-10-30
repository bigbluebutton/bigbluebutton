import React from 'react';
import { toHostReactNode } from '/imports/ui/components/plugins/plugin-icon/utils';
import { SeparatorProps } from './types';
import Styled from './styles';
import PluginButtonIcon from '../../plugins/plugin-icon/styles';

const Separator = ({ icon, actionsBar = false, dataTest = '' }: SeparatorProps) => {
  if (!icon) return (<Styled.Separator actionsBar={actionsBar} data-test={dataTest} />);
  if (typeof icon === 'object' && 'svgContent' in icon) {
    return (
      <Styled.IconContainer data-test={dataTest}>
        <PluginButtonIcon>{toHostReactNode(icon.svgContent)}</PluginButtonIcon>
      </Styled.IconContainer>
    );
  }
  let iconName = '';
  if (typeof icon === 'string') iconName = icon;
  if (icon && typeof icon === 'object' && 'iconName' in icon) iconName = icon.iconName;
  return (
    <Styled.IconContainer data-test={dataTest}>
      <Styled.Icon iconName={iconName} />
    </Styled.IconContainer>
  );
};

export default Separator;
