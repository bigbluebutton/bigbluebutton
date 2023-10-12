import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  PluginProvidedStateContainerChildProps, PluginProvidedState,
  PluginProvidedStateContainerChild,
} from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const UserListItemAdditionalInformationPluginStateContainer = ((
  props: PluginProvidedStateContainerChildProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    userListItemAdditionalInformation,
    setUserListItemAdditionalInformation,
  ] = useState<PluginSdk.UserListItemAdditionalInformation[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].userListItemAdditionalInformation = userListItemAdditionalInformation;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedUserListItemAdditionalInformation = (
      [] as PluginSdk.UserListItemAdditionalInformation[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.userListItemAdditionalInformation),
    );
    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        userListItemAdditionalInformation: aggregatedUserListItemAdditionalInformation,
      },
    );
  }, [userListItemAdditionalInformation]);

  pluginApi.setUserListItemAdditionalInformation = (items: PluginSdk.UserListItemAdditionalInformation[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.UserListItemAdditionalInformation[];
    return setUserListItemAdditionalInformation(itemsWithId);
  };
  return null;
}) as PluginProvidedStateContainerChild;

export default UserListItemAdditionalInformationPluginStateContainer;
