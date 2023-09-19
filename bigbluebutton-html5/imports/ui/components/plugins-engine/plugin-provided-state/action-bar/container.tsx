import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginProvidedStateChildrenProps, PluginProvidedState } from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const ActionBarPluginStateContainer = (
  props: PluginProvidedStateChildrenProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    actionBarItems,
    setActionBarItems,
  ] = useState<PluginSdk.ActionBarItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].actionBarItems = actionBarItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedActionBarItems = (
      [] as PluginSdk.ActionBarItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.actionBarItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        actionBarItems: aggregatedActionBarItems,
      },
    );
  }, [actionBarItems]);

  pluginApi.setActionBarItems = (items: PluginSdk.ActionBarItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.ActionBarItem[];
    return setActionBarItems(itemsWithId);
  };
  return null;
};

export default ActionBarPluginStateContainer;
