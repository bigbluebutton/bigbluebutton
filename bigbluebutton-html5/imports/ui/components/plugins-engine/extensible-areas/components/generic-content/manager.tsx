import {
  useEffect,
  useState,
  useContext,
  useCallback,
} from 'react';
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

  const excludeById = useCallback(
    (arr1: PluginSdk.GenericContentInterface[], arr2: PluginSdk.GenericContentInterface[]) => {
      const idsSet = new Set(arr2.map((item) => item.id));
      return arr1.filter((item) => !idsSet.has(item.id));
    },
    [],
  );

  const genericContentSidekickId = useCallback(
    (id: string) => (
      PANELS.GENERIC_CONTENT_SIDEKICK + id
    ),
    [],
  );

  const filterSidekick = useCallback(
    (genericContentItems: PluginSdk.GenericContentInterface[]) => (
      genericContentItems.filter((gci) => gci.type === GenericContentType.SIDEKICK_AREA)
    ),
    [],
  );

  const unregisterExcludedSidekickContentsFromApps = useCallback(
    (
      currentGenericContentItems: PluginSdk.GenericContentInterface[],
      newGenericContentItems: PluginSdk.GenericContentInterface[],
    ) => {
      const currentGenericSidekickContentItems = filterSidekick(currentGenericContentItems);
      const newGenericSidekickContentItems = filterSidekick(newGenericContentItems);
      if (currentGenericSidekickContentItems.length === 0) return;
      const excluded = excludeById(
        currentGenericSidekickContentItems,
        newGenericSidekickContentItems,
      );
      excluded.forEach((gs) => {
        layoutContextDispatch({
          type: ACTIONS.UNREGISTER_SIDEBAR_APP,
          id: genericContentSidekickId(gs.id),
        });
      });
    },
    [],
  );

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
    const genericContentSidekickArea = filterSidekick(genericContentItems) as PluginSdk.GenericContentSidekickArea[];

    genericContentSidekickArea.forEach((genericContentItem) => {
      return layoutContextDispatch({
        type: ACTIONS.REGISTER_SIDEBAR_APP,
        value: {
          id: genericContentSidekickId(genericContentItem.id),
          name: genericContentItem.name,
          icon: genericContentItem.buttonIcon,
          contentFunction: genericContentItem.contentFunction,
        },
      });
    });
  }, [genericContentItems, setPluginsExtensibleAreasAggregatedState]);

  pluginApi.setGenericContentItems = (items: PluginSdk.GenericContentInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.GenericContentInterface[];
    setGenericContentItems((currentGenericContentItems) => {
      unregisterExcludedSidekickContentsFromApps(currentGenericContentItems, items);
      return itemsWithId;
    });
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default GenericContentPluginStateContainer;
