import React from 'react';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import PluginHelperButtonComponent from './component';

interface PluginButtonContainerProps {
  dark: boolean;
  bottom: boolean;
  right: boolean;
  dataTest?: string;
  icon: PluginIconType;
  label: string;
  onClick: (args:{ browserClickEvent: React.MouseEvent<HTMLElement> }) => void;
}

const PluginButtonContainer = (props: PluginButtonContainerProps) => {
  const {
    dark,
    bottom,
    right,
    icon,
    label,
    onClick,
    dataTest,
  } = props;
  return (
    <PluginHelperButtonComponent
      dark={dark}
      bottom={bottom}
      right={right}
      icon={icon}
      dataTest={dataTest}
      label={label}
      onClick={onClick}
    />
  );
};

export default PluginButtonContainer;
