import React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { ActionsBarItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/actions-bar-item/enums';
import { PluginButtonIcon } from '/imports/ui/components/plugins/plugin-icon/styles';
import Button from '/imports/ui/components/common/button/component';
import Selector from '/imports/ui/components/common/selector/component';
import { SelectorProps } from '/imports/ui/components/common/selector/types';
import ToggleGroup from '/imports/ui/components/common/toggle-group/component';
import Separator from '/imports/ui/components/common/separator/component';
import deviceInfo from '/imports/utils/deviceInfo';

interface PluginButtonProps {
  onClick: () => void;
  hideLabel: boolean;
  color: string;
  size: PluginSdk.PluginButtonSize;
  circle: boolean;
  style: React.CSSProperties;
  label: string;
  tooltipLabel: string;
  dataTest: string;
  icon?: string;
  customIcon?: React.ReactNode;
}

interface ActionsBarPluginItemProps {
  item: PluginSdk.ActionsBarInterface;
}

const ActionsBarPluginItem = ({ item: pluginItem }: ActionsBarPluginItemProps) => {
  switch (pluginItem.type) {
    case ActionsBarItemType.BUTTON: {
      const plugin = pluginItem as PluginSdk.ActionsBarButton;
      const buttonProps: PluginButtonProps = {
        onClick: plugin.onClick,
        hideLabel: plugin.hideLabel !== false,
        color: plugin.color || 'primary',
        size: deviceInfo.isMobile ? 'md' : (plugin.size || 'lg'),
        circle: deviceInfo.isMobile ? true : (plugin.circle !== false),
        style: plugin.style,
        label: plugin.label || plugin.tooltip,
        tooltipLabel: plugin.tooltip,
        dataTest: plugin.dataTest,
      };
      if (typeof plugin?.icon === 'string') {
        buttonProps.icon = plugin.icon;
      } else if (plugin?.icon && typeof plugin.icon === 'object' && 'iconName' in plugin.icon) {
        buttonProps.icon = plugin.icon.iconName;
      } else if (plugin?.icon && typeof plugin.icon === 'object' && 'svgContent' in plugin.icon) {
        buttonProps.customIcon = (
          <PluginButtonIcon>
            {plugin.icon.svgContent as React.ReactNode}
          </PluginButtonIcon>
        );
      }
      return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Button {...buttonProps} />
      );
    }
    case ActionsBarItemType.SEPARATOR: {
      const plugin = pluginItem as PluginSdk.ActionsBarSeparator;
      return (
        <Separator
          actionsBar
          icon={plugin.icon}
          dataTest={plugin.dataTest}
        />
      );
    }
    case ActionsBarItemType.SELECTOR: {
      const plugin = pluginItem as PluginSdk.ActionsBarSelector;
      return (
        <Selector
          title={plugin.title}
          options={plugin.options}
          defaultOption={plugin.defaultOption}
          onChange={plugin.onChange as SelectorProps['onChange']}
          width={plugin.width}
          dataTest={plugin.dataTest}
        />
      );
    }
    case ActionsBarItemType.TOGGLE_GROUP: {
      const plugin = pluginItem as PluginSdk.ActionsBarToggleGroup;
      return (
        <ToggleGroup
          title={plugin.title}
          options={plugin.options}
          defaultOption={plugin.defaultOption}
          onChange={plugin.onChange}
          exclusive={plugin.exclusive}
          dataTest={plugin.dataTest}
        />
      );
    }
    default:
      return null;
  }
};

export default ActionsBarPluginItem;
