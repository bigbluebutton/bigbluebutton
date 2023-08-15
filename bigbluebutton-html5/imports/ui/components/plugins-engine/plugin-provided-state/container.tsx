import { useEffect, useState, useContext } from 'react';
import { PluginProvidedStateContainerProps, PluginsProvidedStateMap, PluginProvidedState } from '../types';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { PluginsContext } from '../../components-data/plugin-context/context';

const pluginProvidedStateMap: PluginsProvidedStateMap = {};

function generateItemWithId<T extends PluginSdk.PluginProvidedUiItemDescriptor>(
  item: T, index: number,
): T {
  const itemWithId = { ...item };
  itemWithId.setItemId(`${index}`);
  return itemWithId;
}

const PluginProvidedStateContainer = (props: PluginProvidedStateContainerProps) => {
  const {
    uuid,
  } = props;
  if (!pluginProvidedStateMap[uuid]) {
    pluginProvidedStateMap[uuid] = {} as PluginProvidedState;
  }
  const pluginApi: PluginSdk.PluginApi = PluginSdk.getPluginApi(uuid);

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

  pluginApi.setPresentationToolbarItems = (items) => {
    const itemsWithId = items.map(generateItemWithId);
    return setPresentationToolbarItems(itemsWithId);
  };
  return null;
};

export default PluginProvidedStateContainer;
