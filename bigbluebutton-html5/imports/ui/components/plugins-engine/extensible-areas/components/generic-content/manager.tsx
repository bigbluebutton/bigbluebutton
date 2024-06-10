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
    genericContents,
    setGenericContents,
  ] = useState<PluginSdk.GenericContentInterface[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].genericContents = genericContents;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedGenericContents = (
      [] as PluginSdk.GenericContentInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.genericContents),
    );
    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        genericContents: aggregatedGenericContents,
      },
    );
  }, [genericContents]);

  pluginApi.setGenericContents = (items: PluginSdk.GenericContentInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.GenericContentInterface[];
    setGenericContents(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default GenericContentPluginStateContainer;
