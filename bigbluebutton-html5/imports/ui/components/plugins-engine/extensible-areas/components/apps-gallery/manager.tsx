import { useEffect, useState, useCallback } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

import { ExtensibleAreaComponentManagerProps, ExtensibleAreaComponentManager } from '../../types';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS } from '/imports/ui/components/layout/enums';

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

  const excludeById = useCallback(
    (arr1: PluginSdk.GenericContentInterface[], arr2: PluginSdk.GenericContentInterface[]) => {
      const idsSet = new Set(arr2.map((item) => item.id));
      return arr1.filter((item) => !idsSet.has(item.id));
    },
    [],
  );

  const unregisterExcludedAppsGalleryItems = useCallback(
    (
      currentAppsGalleryItems: PluginSdk.AppsGalleryInterface[],
      newAppsGalleryItems: PluginSdk.AppsGalleryInterface[],
    ) => {
      if (currentAppsGalleryItems.length === 0) return;
      const excluded = excludeById(
        currentAppsGalleryItems,
        newAppsGalleryItems,
      );
      excluded.forEach((agi) => {
        layoutContextDispatch({
          type: ACTIONS.UNREGISTER_SIDEBAR_APP,
          id: agi.id,
        });
      });
    },
    [],
  );

  useEffect(() => {
    // Change this plugin provided apps gallery items
    extensibleAreaMap[uuid].appsGalleryItems = appsGalleryItems;

    (appsGalleryItems as PluginSdk.AppsGalleryEntry[]).forEach((agi) => {
      return layoutContextDispatch({
        type: ACTIONS.REGISTER_SIDEBAR_APP,
        value: {
          id: agi.id,
          name: agi.name,
          icon: agi.icon,
          onClick: agi.onClick,
        },
      });
    });
  }, [appsGalleryItems]);

  pluginApi.setAppsGalleryItems = (items: PluginSdk.AppsGalleryInterface[]) => {
    const itemsWithId = items.map(generateItemWithId) as PluginSdk.AppsGalleryInterface[];
    setAppsGalleryItems((currentAppsGalleryItems) => {
      unregisterExcludedAppsGalleryItems(currentAppsGalleryItems, items);
      return itemsWithId;
    });
    return itemsWithId.map((i) => i.id);
  };
  return null;
}) as ExtensibleAreaComponentManager;

export default AppsGalleryPluginStateContainer;
