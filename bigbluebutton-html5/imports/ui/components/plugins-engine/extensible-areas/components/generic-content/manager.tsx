import { useEffect, useState, useContext } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import { GenericContentType } from 'bigbluebutton-html-plugin-sdk/dist/cjs/extensible-areas/generic-content-item/enums';

import {
  ExtensibleAreaComponentManagerProps, ExtensibleArea,
  ExtensibleAreaComponentManager,
} from '../../types';
import { PluginsContext } from '../../../../components-data/plugin-context/context';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';

const GenericContentPluginStateContainer = ((
  props: ExtensibleAreaComponentManagerProps,
) => {
  const layoutContextDispatch = layoutDispatch();
  const {
    uuid,
    generateItemWithId,
    extensibleAreaMap,
    pluginApi,
  } = props;
  const [
    genericContentItems,
    setGenericContentItems,
  ] = useState<PluginSdk.GenericContentInterface[]>([]);

  const {
    setPluginsExtensibleAreasAggregatedState,
  } = useContext(PluginsContext);

  useEffect(() => {
    // Change this plugin provided toolbar items
    extensibleAreaMap[uuid].genericContentItems = genericContentItems;

    // Update context with computed aggregated list of all plugin provided toolbar items
    const aggregatedGenericContentItems = (
      [] as PluginSdk.GenericContentInterface[]).concat(
      ...Object.values(extensibleAreaMap)
        .map((extensibleArea: ExtensibleArea) => extensibleArea.genericContentItems),
    );
    setPluginsExtensibleAreasAggregatedState((previousState) => (
      {
        ...previousState,
        genericContentItems: aggregatedGenericContentItems,
      }));
    const genericContentSidekickId = (id: string) => PANELS.GENERIC_CONTENT_SIDEKICK + id;
    const genericContentSidekickArea = genericContentItems
      .filter((g) => g.type === GenericContentType.SIDEKICK_AREA) as PluginSdk.GenericContentSidekickArea[];
    genericContentSidekickArea.map((genericContentItem) => {
      return layoutContextDispatch({
        type: ACTIONS.REGISTER_SIDEBAR_NAVIGATION_WIDGET,
        value: {
          panel: genericContentSidekickId(genericContentItem.id),
          name: genericContentItem.name,
          icon: genericContentItem.buttonIcon,
          contentFunction: genericContentItem.contentFunction,
        },
      });
    });
  }, [genericContentItems, setPluginsExtensibleAreasAggregatedState]);

  pluginApi.setGenericContentItems = (items: PluginSdk.GenericContentInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.GenericContentInterface[];
    setGenericContentItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default GenericContentPluginStateContainer;
