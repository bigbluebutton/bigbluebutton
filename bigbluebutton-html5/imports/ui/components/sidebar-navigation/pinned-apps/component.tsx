import React, { memo } from 'react';
import {
  InjectedAppGalleryItem,
  InjectedWidget,
  SidebarNavigation,
} from '/imports/ui/components/layout/layoutTypes';
import PinnedAppBase from './pinned-app-list-item/component';
import ExternalPinnedApp from './external-pinned-app-list-item/component';
import { PANELS } from '/imports/ui/components/layout/enums';
import useIsPanelOpened from '../hooks/useIsPanelOpened';

interface PinnedAppsProps {
  sidebarNavigationInput: SidebarNavigation;
}

const PinnedApps = ({ sidebarNavigationInput }: PinnedAppsProps) => {
  const { registeredApps = {}, pinnedApps = [] } = sidebarNavigationInput;
  const isPanelOpened = useIsPanelOpened();

  return pinnedApps.map((pinnedAppKey: string) => {
    const pinnedAppInfo = registeredApps[pinnedAppKey];

    const Component = pinnedAppKey.startsWith(PANELS.GENERIC_CONTENT_SIDEKICK)
      ? ExternalPinnedApp
      : PinnedAppBase;

    return (
      <Component
        key={pinnedAppKey}
        appKey={pinnedAppKey}
        appInfo={pinnedAppInfo}
        isOpened={isPanelOpened(pinnedAppKey)}
      />
    );
  });
};

const areAppsEqual = (prevProps: PinnedAppsProps, nextProps: PinnedAppsProps) => {
  const prevSidebarNavigation = prevProps.sidebarNavigationInput;
  const nextSidebarNavigation = nextProps.sidebarNavigationInput;
  const {
    registeredApps: prevRegisteredApps = {},
    pinnedApps: prevPinnedApps = [],
  } = prevSidebarNavigation;
  const {
    registeredApps: nextregisteredApps = {},
    pinnedApps: nextPinnedApps = [],
  } = nextSidebarNavigation;
  const prevRegisteredAppsKeys = Object.keys(prevRegisteredApps);
  const nextregisteredAppsKeys = Object.keys(nextregisteredApps);
  if (prevPinnedApps.length !== nextPinnedApps.length) return false;
  if (prevRegisteredAppsKeys.length !== nextregisteredAppsKeys.length) return false;
  if (!prevPinnedApps.every((prevPinnedApp) => nextPinnedApps.includes(prevPinnedApp))) return false;
  return prevRegisteredAppsKeys
    .filter((prevRegisteredAppsKey) => prevPinnedApps.includes(prevRegisteredAppsKey))
    .every((prevPinnedregisteredAppKey) => {
      const prevApp = prevRegisteredApps[prevPinnedregisteredAppKey];
      const nextApp = nextregisteredApps[prevPinnedregisteredAppKey];

      if (prevApp.hasNotification !== nextApp.hasNotification) {
        return false;
      }

      if (prevApp.name !== nextApp.name || prevApp.icon !== nextApp.icon) {
        return false;
      }

      const prevOnClick = (prevApp as InjectedAppGalleryItem).onClick;
      const nextOnClick = (nextApp as InjectedAppGalleryItem).onClick;

      if (prevOnClick !== nextOnClick) return false;

      const prevContentFunction = (prevApp as InjectedWidget).contentFunction;
      const nextContentFunction = (nextApp as InjectedWidget).contentFunction;

      if (prevContentFunction !== nextContentFunction) return false;

      return true;
    });
};

export default memo(PinnedApps, areAppsEqual);
