import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const GenericComponentPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    genericComponents,
    setGenericComponents,
  ] = useState<PluginSdk.GenericComponentInterface[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].genericComponents = genericComponents;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedGenericComponents = (
      [] as PluginSdk.GenericComponentInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.genericComponents),
    );
    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        genericComponents: aggregatedGenericComponents,
      },
    );
  }, [genericComponents]);

  pluginApi.setGenericComponents = (items: PluginSdk.GenericComponentInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.GenericComponentInterface[];
    return setGenericComponents(itemsWithId);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default GenericComponentPluginStateContainer;
