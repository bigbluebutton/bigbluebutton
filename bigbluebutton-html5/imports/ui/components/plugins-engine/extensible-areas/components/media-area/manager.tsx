import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const MediaAreaPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    mediaAreaItems,
    setMediaAreaItems,
  ] = useState<PluginSdk.MediaAreaInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    if (!extensibleAreaMap[uuid]) {
      extensibleAreaMap[uuid] = {} as ExtensibleArea;
    }
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].mediaAreaItems = mediaAreaItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedMediaAreaItems = (
      [] as PluginSdk.MediaAreaInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.mediaAreaItems),
    );
    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        mediaAreaItems: aggregatedMediaAreaItems,
      }));
  }, [mediaAreaItems]);

  pluginApi.setMediaAreaItems = (items: PluginSdk.MediaAreaInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.MediaAreaInterface[];
    setMediaAreaItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default MediaAreaPluginStateContainer;
