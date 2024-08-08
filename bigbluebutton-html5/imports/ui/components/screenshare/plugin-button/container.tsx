import React from 'react';
import PluginButtonComponent from './component';

interface PluginButtonContainerProps {
  dark: boolean;
  bottom: boolean;
  right: boolean;
  icon: string;
  label: string;
  onClick: () => void;
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
    <PluginButtonComponent
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
