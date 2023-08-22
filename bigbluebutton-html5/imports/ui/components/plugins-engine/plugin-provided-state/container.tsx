import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginProvidedStateContainerProps, PluginsProvidedStateMap, PluginProvidedState } from '../types.ts';
import { PluginsContext } from '../../components-data/plugin-context/context';

const pluginProvidedStateMap: PluginsProvidedStateMap = {};

function generateItemWithId<T extends PluginSdk.PluginProvidedUiItemDescriptor>(
  item: T, index: number,
): T {
  item.setItemId(`${index}`);
  return item;
}

const PluginProvidedStateContainer = (props: PluginProvidedStateContainerProps) => {
  const {
    uuid,
  } = props;
  if (!pluginProvidedStateMap[uuid]) {
    pluginProvidedStateMap[uuid] = {} as PluginProvidedState;
  }
  const pluginApi: PluginSdk.PluginApi = PluginSdk.getPluginApi(uuid);

  const [
    presentationToolbarItems,
    setPresentationToolbarItems,
  ] = useState<PluginSdk.PresentationToolbarItem[]>([]);

  const [
    userListDropdownItems,
    setUserListDropdownItems,
  ] = useState<PluginSdk.UserListDropdownItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].presentationToolbarItems = presentationToolbarItems;
    pluginProvidedStateMap[uuid].userListDropdownItems = userListDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedPresentationToolbarItems = ([] as PluginSdk.PresentationToolbarItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.presentationToolbarItems),
    );
    const aggregatedUserListDropdownItems = (
      [] as PluginSdk.UserListDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.userListDropdownItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        presentationToolbarItems: aggregatedPresentationToolbarItems,
        userListDropdownItems: aggregatedUserListDropdownItems,
      },
    );
  }, [presentationToolbarItems, userListDropdownItems]);

  pluginApi.setPresentationToolbarItems = (items: PluginSdk.PresentationToolbarItem[]) => {
    const itemsWithId = items.map(generateItemWithId);
    return setPresentationToolbarItems(itemsWithId);
  };

  pluginApi.setUserListDropdownItems = (items: PluginSdk.UserListDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId);

    return setUserListDropdownItems(itemsWithId);
  };
  return null;
};

export default PluginProvidedStateContainer;
