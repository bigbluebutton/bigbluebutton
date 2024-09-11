import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const UserCameraHelperPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    userCameraHelperItems,
    setUserCameraHelperItems,
  ] = useState<PluginSdk.UserCameraHelperInterface[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    extensibleAreaMap[uuid].userCameraHelperItems = userCameraHelperItems;

    const aggregatedUserCameraHelperItems = ([] as PluginSdk.UserCameraHelperInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.userCameraHelperItems),
    );

    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        userCameraHelperItems: aggregatedUserCameraHelperItems,
      },
    );
  }, [userCameraHelperItems]);

  pluginApi.setUserCameraHelperItems = (items: PluginSdk.UserCameraHelperInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.UserCameraHelperInterface[];
    setUserCameraHelperItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default UserCameraHelperPluginStateContainer;
