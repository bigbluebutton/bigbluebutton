import React from 'react';
import Styled from './styles';

interface PluginHelperButtonComponentProps {
  dark: boolean;
  bottom: boolean;
  right: boolean;
  icon: string;
  dataTest?: string;
  label: string;
  onClick: (args: { browserClickEvent: React.MouseEvent<HTMLElement> }) => void;
}

const PluginHelperButtonComponent = ({
  dark = false,
  bottom = false,
  onClick,
  right,
  icon,
  dataTest,
  label,
}: PluginHelperButtonComponentProps) => (
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
      onClick={(e: React.MouseEvent<HTMLElement>) => onClick({ browserClickEvent: e })}
      hideLabel
      label={label}
      data-test={dataTest}
    />
  </Styled.PluginButtonWrapper>
);

export default PluginHelperButtonComponent;
