import React from 'react';
import { PluginIconType } from 'bigbluebutton-html-plugin-sdk';
import Styled from './styles';
import { PluginButtonIcon } from '/imports/ui/components/plugins/plugin-icon/styles';

interface PluginHelperButtonComponentProps {
  dark: boolean;
  bottom: boolean;
  right: boolean;
  icon: PluginIconType;
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
}: PluginHelperButtonComponentProps) => {
  let resolvedIcon: string | undefined;
  let resolvedCustomIcon: React.ReactNode | undefined;
  if (typeof icon === 'string') {
    resolvedIcon = icon;
  } else if (icon && typeof icon === 'object' && 'iconName' in icon) {
    resolvedIcon = icon.iconName;
  } else if (icon && typeof icon === 'object' && 'svgContent' in icon) {
    resolvedCustomIcon = <PluginButtonIcon>{icon.svgContent as React.ReactNode}</PluginButtonIcon>;
  }

  return (
    <Styled.PluginButtonWrapper
      {...{
        dark,
        bottom,
        right,
      }}
    >
      <Styled.PluginButton
        color="default"
        icon={resolvedIcon}
        size="sm"
        onClick={(e: React.MouseEvent<HTMLElement>) => onClick({ browserClickEvent: e })}
        hideLabel
        label={label}
        data-test={dataTest}
        customIcon={resolvedCustomIcon}
      />
    </Styled.PluginButtonWrapper>
  );
};

export default PluginHelperButtonComponent;
