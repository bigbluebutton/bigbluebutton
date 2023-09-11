import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginProvidedStateChildrenProps, PluginProvidedState } from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const UserListDropdownPluginStateContainer = (
  props: PluginProvidedStateChildrenProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
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
    pluginProvidedStateMap[uuid].userListDropdownItems = userListDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedUserListDropdownItems = (
      [] as PluginSdk.UserListDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.userListDropdownItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        userListDropdownItems: aggregatedUserListDropdownItems,
      },
    );
  }, [userListDropdownItems]);

  pluginApi.setUserListDropdownItems = (items: PluginSdk.UserListDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.UserListDropdownItem[];
    return setUserListDropdownItems(itemsWithId);
  };
  return null;
};

export default UserListDropdownPluginStateContainer;
