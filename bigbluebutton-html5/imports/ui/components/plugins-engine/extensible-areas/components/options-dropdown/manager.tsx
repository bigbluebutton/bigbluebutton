import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const OptionsDropdownPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    optionsDropdownItems,
    setOptionsDropdownItems,
  ] = useState<PluginSdk.OptionsDropdownItem[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].optionsDropdownItems = optionsDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedOptionsDropdownItems = (
      [] as PluginSdk.OptionsDropdownItem[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.optionsDropdownItems),
    );
    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        optionsDropdownItems: aggregatedOptionsDropdownItems,
      },
    );
  }, [optionsDropdownItems]);

  pluginApi.setOptionsDropdownItems = (items: PluginSdk.OptionsDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.OptionsDropdownItem[];
    return setOptionsDropdownItems(itemsWithId);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default OptionsDropdownPluginStateContainer;
