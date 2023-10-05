import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  PluginProvidedStateContainerChildProps, PluginProvidedState,
  PluginProvidedStateContainerChild,
} from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const FloatingWindowPluginStateContainer = ((
  props: PluginProvidedStateContainerChildProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    floatingWindowItems,
    setFloatingWindowItems,
  ] = useState<PluginSdk.FloatingWindowItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].floatingWindowItems = floatingWindowItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedFloatingWindowItems = (
      [] as PluginSdk.FloatingWindowItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.floatingWindowItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        floatingWindowItems: aggregatedFloatingWindowItems,
      },
    );
  }, [floatingWindowItems]);

  pluginApi.setFloatingWindowItems = (items: PluginSdk.FloatingWindowItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.FloatingWindowItem[];
    return setFloatingWindowItems(itemsWithId);
  };
  return null;
}) as PluginProvidedStateContainerChild;

export default FloatingWindowPluginStateContainer;
