import React from 'react';
import Styled from './styles';

interface PluginButtonComponentProps {
  dark: boolean;
  bottom: boolean;
  right: boolean;
  icon: string;
  label: string;
  onClick: () => void;
}

const PluginButtonComponent = ({
  dark = false,
  bottom = false,
  onClick = () => {},
  right,
  icon,
  label,
}: PluginButtonComponentProps) => (
  <Styled.PluginButtonWrapper
    {...{
      dark,
      bottom,
      right,
    }}
  >
    <Styled.PluginButton
      color="default"
      icon={icon}
      size="sm"
      onClick={onClick}
      hideLabel
      label={label}
      data-test="switchButton"
    />
  </Styled.PluginButtonWrapper>
);

export default PluginButtonComponent;
