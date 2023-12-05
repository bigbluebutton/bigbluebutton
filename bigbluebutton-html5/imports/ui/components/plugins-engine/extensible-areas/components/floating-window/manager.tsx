import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const FloatingWindowPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    floatingWindowItems,
    setFloatingWindowItems,
  ] = useState<PluginSdk.FloatingWindowItem[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].floatingWindowItems = floatingWindowItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedFloatingWindowItems = (
      [] as PluginSdk.FloatingWindowItem[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.floatingWindowItems),
    );
    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        floatingWindowItems: aggregatedFloatingWindowItems,
      },
    );
  }, [floatingWindowItems]);

  pluginApi.setFloatingWindowItems = (items: PluginSdk.FloatingWindowItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.FloatingWindowItem[];
    return setFloatingWindowItems(itemsWithId);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default FloatingWindowPluginStateContainer;
