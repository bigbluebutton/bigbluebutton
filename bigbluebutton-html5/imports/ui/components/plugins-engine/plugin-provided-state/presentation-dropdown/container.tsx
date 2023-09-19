import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginProvidedStateChildrenProps, PluginProvidedState } from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const PresentationDropdownPluginStateContainer = (
  props: PluginProvidedStateChildrenProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    presentationDropdownItems,
    setPresentationDropdownItems,
  ] = useState<PluginSdk.PresentationDropdownItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].presentationDropdownItems = presentationDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedPresentationDropdownItems = (
      [] as PluginSdk.PresentationDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.presentationDropdownItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        presentationDropdownItems: aggregatedPresentationDropdownItems,
      },
    );
  }, [presentationDropdownItems]);

  pluginApi.setPresentationDropdownItems = (items: PluginSdk.PresentationDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.PresentationDropdownItem[];
    return setPresentationDropdownItems(itemsWithId);
  };
  return null;
};

export default PresentationDropdownPluginStateContainer;
