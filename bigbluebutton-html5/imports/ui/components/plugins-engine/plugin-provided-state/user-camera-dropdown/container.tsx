import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  PluginProvidedStateContainerChildProps, PluginProvidedState,
  PluginProvidedStateContainerChild,
} from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const UserCameraDropdownPluginStateContainer = ((
  props: PluginProvidedStateContainerChildProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    userCameraDropdownItems,
    setUserCameraDropdownItems,
  ] = useState<PluginSdk.UserCameraDropdownItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].userCameraDropdownItems = userCameraDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedUserCameraDropdownItems = (
      [] as PluginSdk.UserCameraDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.userCameraDropdownItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        userCameraDropdownItems: aggregatedUserCameraDropdownItems,
      },
    );
  }, [userCameraDropdownItems]);

  pluginApi.setUserCameraDropdownItems = (items: PluginSdk.UserCameraDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.UserCameraDropdownItem[];
    return setUserCameraDropdownItems(itemsWithId);
  };
  return null;
}) as PluginProvidedStateContainerChild;

export default UserCameraDropdownPluginStateContainer;
