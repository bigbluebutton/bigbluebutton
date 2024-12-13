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
  ] = useState<PluginSdk.UserCameraDropdownInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].userCameraDropdownItems = userCameraDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedUserCameraDropdownItems = (
      [] as PluginSdk.UserCameraDropdownInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.userCameraDropdownItems),
    );
    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        userCameraDropdownItems: aggregatedUserCameraDropdownItems,
      }));
  }, [userCameraDropdownItems]);

  pluginApi.setUserCameraDropdownItems = (items: PluginSdk.UserCameraDropdownInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.UserCameraDropdownInterface[];
    setUserCameraDropdownItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default UserCameraDropdownPluginStateContainer;
