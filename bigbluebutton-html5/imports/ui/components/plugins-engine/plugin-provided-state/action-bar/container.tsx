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
  ] = useState<PluginSdk.ActionsBarItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].actionsBarItems = actionBarItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedActionBarItems = (
      [] as PluginSdk.ActionsBarItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.actionsBarItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        actionsBarItems: aggregatedActionBarItems,
      },
    );
  }, [actionBarItems]);

  pluginApi.setActionsBarItems = (items: PluginSdk.ActionsBarItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.ActionsBarItem[];
    return setActionBarItems(itemsWithId);
  };
  return null;
};

export default ActionBarPluginStateContainer;
