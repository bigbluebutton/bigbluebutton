import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';

const PresentationToolbarPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    presentationToolbarItems,
    setPresentationToolbarItems,
  ] = useState<PluginSdk.PresentationToolbarInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].presentationToolbarItems = presentationToolbarItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedPresentationToolbarItems = ([] as PluginSdk.PresentationToolbarInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.presentationToolbarItems),
    );

    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        presentationToolbarItems: aggregatedPresentationToolbarItems,
      }));
  }, [presentationToolbarItems]);

  pluginApi.setPresentationToolbarItems = (items: PluginSdk.PresentationToolbarInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.PresentationToolbarInterface[];
    setPresentationToolbarItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default PresentationToolbarPluginStateContainer;
