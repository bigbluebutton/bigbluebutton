import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const ActionButtonDropdownPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    actionButtonDropdownItems,
    setActionButtonDropdownItems,
  ] = useState<PluginSdk.ActionButtonDropdownInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].actionButtonDropdownItems = actionButtonDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedActionButtonDropdownItems = (
      [] as PluginSdk.ActionButtonDropdownInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.actionButtonDropdownItems),
    );
    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        actionButtonDropdownItems: aggregatedActionButtonDropdownItems,
      }));
  }, [actionButtonDropdownItems]);

  pluginApi.setActionButtonDropdownItems = (items: PluginSdk.ActionButtonDropdownInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.ActionButtonDropdownInterface[];
    setActionButtonDropdownItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default ActionButtonDropdownPluginStateContainer;
