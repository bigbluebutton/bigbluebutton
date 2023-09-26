import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  PluginProvidedStateContainerChildProps, PluginProvidedState,
  PluginProvidedStateContainerChild,
} from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const PresentationToolbarPluginStateContainer = ((
  props: PluginProvidedStateContainerChildProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    presentationToolbarItems,
    setPresentationToolbarItems,
  ] = useState<PluginSdk.PresentationToolbarItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].presentationToolbarItems = presentationToolbarItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedPresentationToolbarItems = ([] as PluginSdk.PresentationToolbarItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.presentationToolbarItems),
    );

    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        presentationToolbarItems: aggregatedPresentationToolbarItems,
      },
    );
  }, [presentationToolbarItems]);

  pluginApi.setPresentationToolbarItems = (items: PluginSdk.PresentationToolbarItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.PresentationToolbarItem[];
    return setPresentationToolbarItems(itemsWithId);
  };
  return null;
}) as PluginProvidedStateContainerChild;

export default PresentationToolbarPluginStateContainer;
