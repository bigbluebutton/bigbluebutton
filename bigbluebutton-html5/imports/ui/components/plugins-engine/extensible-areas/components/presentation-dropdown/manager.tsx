import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const PresentationDropdownPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    presentationDropdownItems,
    setPresentationDropdownItems,
  ] = useState<PluginSdk.PresentationDropdownItem[]>([]);

  const {
    pluginsExtensibleAreasAggregatedState,
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].presentationDropdownItems = presentationDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedPresentationDropdownItems = (
      [] as PluginSdk.PresentationDropdownItem[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.presentationDropdownItems),
    );
    setPluginsExtensibleAreasAggregatedState(
      {
        ...pluginsExtensibleAreasAggregatedState,
        presentationDropdownItems: aggregatedPresentationDropdownItems,
      },
    );
  }, [presentationDropdownItems]);

  pluginApi.setPresentationDropdownItems = (items: PluginSdk.PresentationDropdownItem[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.PresentationDropdownItem[];
    return setPresentationDropdownItems(itemsWithId);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default PresentationDropdownPluginStateContainer;
