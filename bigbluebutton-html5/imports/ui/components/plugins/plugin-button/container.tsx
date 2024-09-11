import React from 'react';
import PluginHelperButtonComponent from './component';

interface PluginButtonContainerProps {
  dark: boolean;
  bottom: boolean;
  right: boolean;
  icon: string;
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
  } = props;
  return (
    <PluginHelperButtonComponent
      dark={dark}
      bottom={bottom}
      right={right}
      icon={icon}
      label={label}
      onClick={onClick}
    />
  );
};

export default PluginButtonContainer;
