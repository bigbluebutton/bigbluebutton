import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const GenericContentPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    genericContentItems,
    setGenericContentItems,
  ] = useState<PluginSdk.GenericContentInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].genericContentItems = genericContentItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedGenericContentItems = (
      [] as PluginSdk.GenericContentInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.genericContentItems),
    );
    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        genericContentItems: aggregatedGenericContentItems,
      }));
  }, [genericContentItems, setPluginsExtensibleAreasAggregatedState]);

  pluginApi.setGenericContentItems = (items: PluginSdk.GenericContentInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.GenericContentInterface[];
    setGenericContentItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default GenericContentPluginStateContainer;
