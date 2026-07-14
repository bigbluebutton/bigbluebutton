import React, { ReactNode } from 'react';
import Icon from '/imports/ui/components/common/icon/component';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import { PluginButtonIcon } from '/imports/ui/components/plugins/plugin-icon/styles';

const resolveIcon = (icon: PluginIconType): React.ReactNode => {
  if (typeof icon === 'string') return <Icon iconName={icon} />;
  if (icon && typeof icon === 'object' && 'iconName' in icon) {
    return <Icon iconName={icon.iconName} />;
  }
  if (icon && typeof icon === 'object' && 'svgContent' in icon) {
    const svgContent = icon.svgContent as ReactNode;
    return <PluginButtonIcon>{svgContent}</PluginButtonIcon>;
  }
  return null;
};

export default resolveIcon;
