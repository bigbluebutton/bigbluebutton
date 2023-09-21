import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { PluginProvidedStateChildrenProps, PluginProvidedState } from '../../types';
import { PluginsContext } from '../../../components-data/plugin-context/context';

const NavBarPluginStateContainer = (
  props: PluginProvidedStateChildrenProps,
) => {
  const {
    uuid,
    generateItemWithId,
    pluginProvidedStateMap,
    pluginApi,
  } = props;
  const [
    navBarItems,
    setNavBarItems,
  ] = useState<PluginSdk.NavBarItem[]>([]);

  const {
    pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    pluginProvidedStateMap[uuid].navBarItems = navBarItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedNavBarItems = ([] as PluginSdk.NavBarItem[]).concat(
      ...Object.values(pluginProvidedStateMap)
        .map((pps: PluginProvidedState) => pps.navBarItems),
    );

    setPluginsProvidedAggregatedState(
      {
        ...pluginsProvidedAggregatedState,
        navBarItems: aggregatedNavBarItems,
      },
    );
  }, [navBarItems]);

  pluginApi.setNavBarItems = (items: PluginSdk.NavBarItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.NavBarItem[];
    return setNavBarItems(itemsWithId);
  };
  return null;
};

export default NavBarPluginStateContainer;
