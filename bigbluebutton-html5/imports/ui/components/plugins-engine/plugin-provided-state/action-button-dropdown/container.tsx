import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  PluginProvidedStateContainerChildProps, PluginProvidedState,
  PluginProvidedStateContainerChild,
} from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const ActionButtonDropdownPluginStateContainer = ((
  props: PluginProvidedStateContainerChildProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    actionButtonDropdownItems,
    setActionButtonDropdownItems,
  ] = useState<PluginSdk.ActionButtonDropdownItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].actionButtonDropdownItems = actionButtonDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedActionButtonDropdownItems = (
      [] as PluginSdk.ActionButtonDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.actionButtonDropdownItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        actionButtonDropdownItems: aggregatedActionButtonDropdownItems,
      },
    );
  }, [actionButtonDropdownItems]);

  pluginApi.setActionButtonDropdownItems = (items: PluginSdk.ActionButtonDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.ActionButtonDropdownItem[];
    return setActionButtonDropdownItems(itemsWithId);
  };
  return null;
}) as PluginProvidedStateContainerChild;

export default ActionButtonDropdownPluginStateContainer;
