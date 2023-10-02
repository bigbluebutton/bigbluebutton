import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  PluginProvidedStateContainerChildProps, PluginProvidedState,
  PluginProvidedStateContainerChild,
} from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const UserListIconPluginStateContainer = ((
  props: PluginProvidedStateContainerChildProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    userListIconItems,
    setUserListIconItems,
  ] = useState<PluginSdk.UserListIconItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].userListIconItems = userListIconItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedUserListIconItems = (
      [] as PluginSdk.UserListIconItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.userListIconItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        userListIconItems: aggregatedUserListIconItems,
      },
    );
  }, [userListIconItems]);

  pluginApi.setUserListIconItems = (items: PluginSdk.UserListIconItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.UserListIconItem[];
    return setUserListIconItems(itemsWithId);
  };
  return null;
}) as PluginProvidedStateContainerChild;

export default UserListIconPluginStateContainer;
