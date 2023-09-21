import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginProvidedStateChildrenProps, PluginProvidedState } from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const OptionsDropdownPluginStateContainer = (
  props: PluginProvidedStateChildrenProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    optionsDropdownItems,
    setOptionsDropdownItems,
  ] = useState<PluginSdk.OptionsDropdownItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].optionsDropdownItems = optionsDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedOptionsDropdownItems = (
      [] as PluginSdk.OptionsDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.optionsDropdownItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        optionsDropdownItems: aggregatedOptionsDropdownItems,
      },
    );
  }, [optionsDropdownItems]);

  pluginApi.setOptionsDropdownItems = (items: PluginSdk.OptionsDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.OptionsDropdownItem[];
    return setOptionsDropdownItems(itemsWithId);
  };
  return null;
};

export default OptionsDropdownPluginStateContainer;
