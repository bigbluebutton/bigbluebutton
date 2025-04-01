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
  ] = useState<PluginSdk.ActionsBarInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].actionsBarItems = actionBarItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedActionBarItems = (
      [] as PluginSdk.ActionsBarInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.actionsBarItems),
    );
    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        actionsBarItems: aggregatedActionBarItems,
      }));
  }, [actionBarItems]);

  pluginApi.setActionsBarItems = (items: PluginSdk.ActionsBarInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.ActionsBarInterface[];
    setActionBarItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default ActionBarPluginStateContainer;
