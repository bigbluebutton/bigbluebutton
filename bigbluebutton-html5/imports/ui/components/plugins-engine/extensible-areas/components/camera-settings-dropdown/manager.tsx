import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const CameraSettingsDropdownPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    cameraSettingsDropdownItems,
    setCameraSettingsDropdownItems,
  ] = useState<PluginSdk.CameraSettingsDropdownInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].cameraSettingsDropdownItems = cameraSettingsDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedCameraSettingsDropdownItems = (
      [] as PluginSdk.CameraSettingsDropdownInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.cameraSettingsDropdownItems),
    );
    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        cameraSettingsDropdownItems: aggregatedCameraSettingsDropdownItems,
      }));
  }, [cameraSettingsDropdownItems]);

  pluginApi.setCameraSettingsDropdownItems = (items: PluginSdk.CameraSettingsDropdownInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.CameraSettingsDropdownInterface[];
    setCameraSettingsDropdownItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default CameraSettingsDropdownPluginStateContainer;
