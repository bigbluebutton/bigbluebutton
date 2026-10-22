import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { ActionsBarItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/actions-bar-item/enums';
import deviceInfo from '/imports/utils/deviceInfo';
import { BAR_PRIORITY_WEIGHTS } from '/imports/ui/core/singletons/barPriorityController';
import {
  getPluginButtonOverflowEntry,
  getPluginSlotId,
} from '/imports/ui/components/common/bar-overflow/service';
import {
  OverflowMenuEntry,
  PluginBarButton,
  UnorderedBarItemDescriptor,
} from '/imports/ui/components/common/bar-overflow/types';

export const ACTIONS_BAR_EXPAND_PLUGIN_TYPES = [
  ActionsBarItemType.SELECTOR,
  ActionsBarItemType.TOGGLE_GROUP,
];
export const ACTIONS_BAR_OVERFLOW_BUTTON_ID = 'overflowButton';
export const ACTIONS_BAR_OVERFLOW_BUTTON_SIZE = deviceInfo.isMobile ? 'md' : 'lg';
export const ACTIONS_BAR_FOCUSABLE_SELECTOR = 'button:not([disabled]), [href], input:not([disabled]), select, textarea, [tabindex]:not([tabindex="-1"])';

export const ACTIONS_BAR_OVERFLOW_MENU_OPTS = {
  id: 'actions-bar-overflow-menu',
  keepMounted: true,
  transitionDuration: 0,
  elevation: 3,
  getcontentanchorel: null,
  fullwidth: 'true',
  anchorOrigin: { vertical: 'top', horizontal: 'center' },
  transformOrigin: { vertical: 'bottom', horizontal: 'center' },
};

// An icon labels the plugin tools next to it, which only the expanded mode shows, while a menu row
// cannot show a separator's icon.
export const isActionsBarIconSeparator = (plugin: PluginSdk.ActionsBarInterface) => (
  plugin.type === ActionsBarItemType.SEPARATOR && !!(plugin as PluginSdk.ActionsBarSeparator).icon
);

export const getActionsBarPluginDescriptor = (
  plugin: PluginSdk.ActionsBarInterface,
): UnorderedBarItemDescriptor => ({
  id: getPluginSlotId(plugin),
  priority: BAR_PRIORITY_WEIGHTS.PLUGIN,
  kind: ACTIONS_BAR_EXPAND_PLUGIN_TYPES.includes(plugin.type as ActionsBarItemType)
    || isActionsBarIconSeparator(plugin)
    ? 'expand'
    : 'menu',
});

// Selectors and toggle groups keep their own state, so they go to the expanded mode instead.
export const getActionsBarPluginOverflowEntries = (plugin: PluginBarButton & {
  type?: string;
}): OverflowMenuEntry[] => {
  switch (plugin.type) {
    case ActionsBarItemType.BUTTON:
      return [getPluginButtonOverflowEntry(plugin)];
    case ActionsBarItemType.SEPARATOR:
      return [{ key: getPluginSlotId(plugin), isSeparator: true }];
    default:
      return [];
  }
};
