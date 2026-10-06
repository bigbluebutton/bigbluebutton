import {
  useEffect,
  useState,
  useContext,
  useCallback,
  useRef,
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
import { shouldPinAppsGalleryItem } from '/imports/ui/components/apps-gallery/service';

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

  const { pluginName } = pluginApi;

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

  // Sidebar apps this plugin currently has registered in the layout context.
  const registeredSidekickAppIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (pluginName === undefined) return;
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

    // Unregister only the sidekick apps that went away: unregistering one drops it from
    // the pinned apps, and registering it again would send it to the end of that list.
    const sidekickAppIds = new Set(
      genericContentSidekickArea.map((gci) => genericContentSidekickId(gci.id)),
    );
    registeredSidekickAppIdsRef.current.forEach((id) => {
      if (sidekickAppIds.has(id)) return;
      layoutContextDispatch({ type: ACTIONS.UNREGISTER_SIDEBAR_APP, id });
    });
    registeredSidekickAppIdsRef.current = sidekickAppIds;

    genericContentSidekickArea.forEach((genericContentItem) => {
      layoutContextDispatch({
        type: ACTIONS.REGISTER_SIDEBAR_APP,
        value: {
          id: genericContentSidekickId(genericContentItem.id),
          name: genericContentItem.name,
          icon: genericContentItem.buttonIcon,
          contentFunction: genericContentItem.contentFunction,
          dataTest: genericContentItem.dataTest,
          uuid,
          pluginName,
        },
      });
      if (shouldPinAppsGalleryItem(pluginName, genericContentItem.id)) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_APP,
          value: {
            id: genericContentSidekickId(genericContentItem.id),
            pin: true,
            isPluginDefault: true,
          },
        });
      }
    });
    // If multiple sidekick items are registered with open: true, only the last one is opened.
    const lastOpenSidekick = genericContentSidekickArea.slice().reverse().find((gci) => gci.open);
    if (lastOpenSidekick) {
      layoutContextDispatch({
        type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
        value: genericContentSidekickId(lastOpenSidekick.id),
      });
      layoutContextDispatch({ type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN, value: true });
    }
  }, [genericContentItems, setPluginsExtensibleAreasAggregatedState, pluginName]);

  pluginApi.setGenericContentItems = (items: PluginSdk.GenericContentInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.GenericContentInterface[];
    setGenericContentItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default GenericContentPluginStateContainer;
