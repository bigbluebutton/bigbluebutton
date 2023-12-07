import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginsContext } from '../../../../components-data/plugin-context/context';
import { ExtensibleArea, ExtensibleAreaComponentManagerProps, ExtensibleAreaComponentManager } from '../../types';

const ActionBarPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    actionBarItems,
    setActionBarItems,
  ] = useState<PluginSdk.ActionsBarItem[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].actionsBarItems = actionBarItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedActionBarItems = (
      [] as PluginSdk.ActionsBarItem[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.actionsBarItems),
    );
    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        actionsBarItems: aggregatedActionBarItems,
      },
    );
  }, [actionBarItems]);

  pluginApi.setActionsBarItems = (items: PluginSdk.ActionsBarItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.ActionsBarItem[];
    return setActionBarItems(itemsWithId);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default ActionBarPluginStateContainer;
