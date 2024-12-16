import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const ScreenshareHelperPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    screenshareHelperItems,
    setScreenshareHelperItems,
  ] = useState<PluginSdk.ScreenshareHelperInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    extensibleAreaMap[uuid].screenshareHelperItems = screenshareHelperItems;

    const aggregatedScreenshareHelperItems = ([] as PluginSdk.ScreenshareHelperInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.screenshareHelperItems),
    );

    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        screenshareHelperItems: aggregatedScreenshareHelperItems,
      }));
  }, [screenshareHelperItems]);

  pluginApi.setScreenshareHelperItems = (items: PluginSdk.ScreenshareHelperInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.ScreenshareHelperInterface[];
    setScreenshareHelperItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default ScreenshareHelperPluginStateContainer;
