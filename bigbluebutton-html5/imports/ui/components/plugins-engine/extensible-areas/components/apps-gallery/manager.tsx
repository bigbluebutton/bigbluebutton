import { useEffect, useState, useRef } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { ExtensibleAreaComponentManagerProps, ExtensibleAreaComponentManager } from '../../types';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS } from '/imports/ui/components/layout/enums';
import { shouldPinAppsGalleryItem } from '/imports/ui/components/apps-gallery/service';

const AppsGalleryPluginStateContainer = ((
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
    appsGalleryItems,
    setAppsGalleryItems,
  ] = useState<PluginSdk.AppsGalleryInterface[]>([]);

  const { pluginName } = pluginApi;

  // Sidebar apps this plugin currently has registered in the layout context.
  const registeredAppIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (pluginName === undefined) return;
    // Change this plugin provided apps gallery items
    extensibleAreaMap[uuid].appsGalleryItems = appsGalleryItems;

    // Unregister only the apps that went away: unregistering one drops it from the
    // pinned apps, and registering it again would send it to the end of that list.
    const appIds = new Set(appsGalleryItems.map((agi) => agi.id));
    registeredAppIdsRef.current.forEach((id) => {
      if (appIds.has(id)) return;
      layoutContextDispatch({ type: ACTIONS.UNREGISTER_SIDEBAR_APP, id });
    });
    registeredAppIdsRef.current = appIds;

    (appsGalleryItems as PluginSdk.AppsGalleryEntry[]).forEach((agi) => {
      layoutContextDispatch({
        type: ACTIONS.REGISTER_SIDEBAR_APP,
        value: {
          id: agi.id,
          name: agi.name,
          icon: agi.icon,
          onClick: agi.onClick,
          dataTest: agi.dataTest,
          uuid,
          pluginName,
        },
      });
      if (shouldPinAppsGalleryItem(pluginName, agi.id)) {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_NAVIGATION_PIN_APP,
          value: {
            id: agi.id,
            pin: true,
            isPluginDefault: true,
          },
        });
      }
    });
  }, [appsGalleryItems, pluginName]);

  pluginApi.setAppsGalleryItems = (items: PluginSdk.AppsGalleryInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.AppsGalleryInterface[];
    setAppsGalleryItems(itemsWithId);
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default AppsGalleryPluginStateContainer;
