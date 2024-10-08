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
  ] = useState<PluginSdk.PresentationDropdownInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].presentationDropdownItems = presentationDropdownItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedPresentationDropdownItems = (
      [] as PluginSdk.PresentationDropdownInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.presentationDropdownItems),
    );
    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        presentationDropdownItems: aggregatedPresentationDropdownItems,
      }));
  }, [presentationDropdownItems]);

  pluginApi.setPresentationDropdownItems = (items: PluginSdk.PresentationDropdownInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.PresentationDropdownInterface[];
    setPresentationDropdownItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default PresentationDropdownPluginStateContainer;
