import React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { NavBarItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/nav-bar-item/enums';
import Button from '/imports/ui/components/common/button/component';
import { PluginButtonIcon } from '/imports/ui/components/plugins/plugin-icon/styles';
import Styled from '../styles';

interface PluginButtonIconProps {
  icon?: string;
  customIcon?: React.ReactNode;
}

interface NavBarPluginItemProps {
  item: PluginSdk.NavBarInterface;
}

const NavBarPluginItem = ({ item: pluginItem }: NavBarPluginItemProps) => {
  let returnComponent: React.ReactNode;
  switch (pluginItem.type) {
    case NavBarItemType.BUTTON: {
      const plugin = pluginItem as PluginSdk.NavBarButton;
      const navBarIconProps: PluginButtonIconProps = {};
      if (typeof plugin?.icon === 'string') navBarIconProps.icon = plugin.icon;
      else if (plugin?.icon && typeof plugin.icon === 'object' && 'iconName' in plugin.icon) navBarIconProps.icon = plugin.icon.iconName;
      else if (plugin?.icon && typeof plugin.icon === 'object' && 'svgContent' in plugin.icon) {
        navBarIconProps.customIcon = (
          <PluginButtonIcon>
            {plugin.icon.svgContent as React.ReactNode}
          </PluginButtonIcon>
        );
      }
      returnComponent = (
        <Styled.PluginComponentWrapper
          key={`${plugin.id}-${plugin.type}`}
        >
          <Button
            disabled={plugin.disabled}
            label={plugin.label}
            aria-label={plugin.tooltip}
            color={plugin.color || 'primary'}
            circle={plugin.circle === true}
            hideLabel={plugin.hideLabel === true}
            size={plugin.size || 'md'}
            style={plugin.style}
            tooltipLabel={plugin.tooltip}
            onClick={plugin.onClick}
            dataTest={plugin.dataTest}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...navBarIconProps}
          />
        </Styled.PluginComponentWrapper>
      );
      break;
    }
    case NavBarItemType.INFO: {
      const plugin = pluginItem as PluginSdk.NavBarInfo;
      returnComponent = (
        <Styled.PluginComponentWrapper
          key={`${plugin.id}-${plugin.type}`}
        >
          <Styled.PluginInfoComponent data-test={plugin.dataTest}>
            {plugin.label}
          </Styled.PluginInfoComponent>
        </Styled.PluginComponentWrapper>
      );
      break;
    }
    default:
      returnComponent = null;
      break;
  }
  if (pluginItem.hasSeparator) {
    switch (pluginItem.position) {
      case PluginSdk.NavBarItemPosition.RIGHT:
        returnComponent = (
          <>
            {returnComponent}
            <Styled.PluginSeparatorWrapper key={`${pluginItem.id}-${pluginItem.type}-separator`}>
              |
            </Styled.PluginSeparatorWrapper>
          </>
        );
        break;
      default:
        returnComponent = (
          <>
            <Styled.PluginSeparatorWrapper key={`${pluginItem.id}-${pluginItem.type}-separator`}>
              |
            </Styled.PluginSeparatorWrapper>
            {returnComponent}
          </>
        );
        break;
    }
  }
  return returnComponent;
};

export default NavBarPluginItem;
