import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { NavBarItemType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/nav-bar-item/enums';
import { BAR_PRIORITY_WEIGHTS } from '/imports/ui/core/singletons/barPriorityController';
import {
  getPluginButtonOverflowEntry,
  getPluginOptionDataTest,
  getPluginSlotId,
} from '/imports/ui/components/common/bar-overflow/service';
import {
  OverflowMenuEntry,
  PluginBarButton,
  UnorderedBarItemDescriptor,
} from '/imports/ui/components/common/bar-overflow/types';

export const NAV_BAR_TITLE_RESERVED_WIDTH_MAX = 160;

export const getNavBarPluginDescriptor = (
  pluginItem: PluginSdk.NavBarInterface,
): UnorderedBarItemDescriptor => ({
  id: getPluginSlotId(pluginItem),
  priority: BAR_PRIORITY_WEIGHTS.PLUGIN,
});

export const getNavBarPluginOverflowEntries = (pluginItem: PluginBarButton & {
  type?: string;
}): OverflowMenuEntry[] => {
  switch (pluginItem.type) {
    case NavBarItemType.BUTTON:
      return [getPluginButtonOverflowEntry(pluginItem)];
    case NavBarItemType.INFO:
      return [{
        key: getPluginSlotId(pluginItem),
        label: pluginItem.label,
        dataTest: getPluginOptionDataTest(pluginItem.dataTest),
      }];
    default:
      return [];
  }
};
