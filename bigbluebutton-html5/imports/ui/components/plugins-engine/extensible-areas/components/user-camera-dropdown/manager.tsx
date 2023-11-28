import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const UserCameraDropdownPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    userCameraDropdownItems,
    setUserCameraDropdownItems,
  ] = useState<PluginSdk.UserCameraDropdownItem[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].userCameraDropdownItems = userCameraDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedUserCameraDropdownItems = (
      [] as PluginSdk.UserCameraDropdownItem[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.userCameraDropdownItems),
    );
    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        userCameraDropdownItems: aggregatedUserCameraDropdownItems,
      },
    );
  }, [userCameraDropdownItems]);

  pluginApi.setUserCameraDropdownItems = (items: PluginSdk.UserCameraDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.UserCameraDropdownItem[];
    return setUserCameraDropdownItems(itemsWithId);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default UserCameraDropdownPluginStateContainer;
