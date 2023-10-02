import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  PluginProvidedStateContainerChildProps, PluginProvidedState,
  PluginProvidedStateContainerChild,
} from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const CameraSettingsDropdownPluginStateContainer = ((
  props: PluginProvidedStateContainerChildProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    cameraSettingsDropdownItems,
    setCameraSettingsDropdownItems,
  ] = useState<PluginSdk.CameraSettingsDropdownItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].cameraSettingsDropdownItems = cameraSettingsDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedCameraSettingsDropdownItems = (
      [] as PluginSdk.CameraSettingsDropdownItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.cameraSettingsDropdownItems),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        cameraSettingsDropdownItems: aggregatedCameraSettingsDropdownItems,
      },
    );
  }, [cameraSettingsDropdownItems]);

  pluginApi.setCameraSettingsDropdownItems = (items: PluginSdk.CameraSettingsDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.CameraSettingsDropdownItem[];
    return setCameraSettingsDropdownItems(itemsWithId);
  };
  return null;
}) as PluginProvidedStateContainerChild;

export default CameraSettingsDropdownPluginStateContainer;
