import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const NavBarPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    navBarItems,
    setNavBarItems,
  ] = useState<PluginSdk.NavBarInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].navBarItems = navBarItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedNavBarItems = ([] as PluginSdk.NavBarInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.navBarItems),
    );

    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        navBarItems: aggregatedNavBarItems,
      }));
  }, [navBarItems]);

  pluginApi.setNavBarItems = (items: PluginSdk.NavBarInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.NavBarInterface[];
    setNavBarItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default NavBarPluginStateContainer;
