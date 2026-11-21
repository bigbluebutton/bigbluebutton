import React, { memo, useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '/imports/ui/components/layout/enums';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import usePanelClose from '/imports/ui/components/common/panel-header/usePanelClose';
import { useGenericContentBadgeIds } from '/imports/ui/core/local-states/useGenericContentBadges';
import useIsSpecificPanelOpened from '../hooks/useIsSpecificPanelOpened';

const intlMessages = defineMessages({
  wigetsLabel: {
    id: 'app.userList.appsTitle',
    description: 'Title for the apps panel',
  },
});

// A plugin replacing its gallery items unregisters the old ones before it
// registers the new ones, so the registry can be empty for a moment. The open
// gallery is only closed if it stays empty for this long.
const CLOSE_EMPTY_GALLERY_DELAY = 1000; // ms

const AppsListItem: React.FC = () => {
  const intl = useIntl();
  const isOpened = useIsSpecificPanelOpened(PANELS.APPS_GALLERY);
  const label = intl.formatMessage(intlMessages.wigetsLabel);
  const badgedAppIds = useGenericContentBadgeIds();
  // Apps are registered according to the user's role (e.g. polls only for the
  // presenter, timer only for moderators) and plugin availability, so an empty
  // registry means there is nothing this user can pick from the gallery.
  const hasApps = layoutSelectInput(
    (i: Input) => Object.keys(i.sidebarNavigation.registeredApps || {}).length > 0,
  );
  const { closePanel } = usePanelClose(PANELS.APPS_GALLERY);

  // A pinned app shows the badge on its own button and an open one needs no
  // reminder, so only badges hidden inside the gallery count. Derived inside the
  // selector so that layout changes re-render this button only when it flips.
  const hasHiddenAppBadge = layoutSelectInput((i: Input) => {
    if (isOpened) return false;
    const { registeredApps, pinnedApps } = i.sidebarNavigation;
    const { sidebarContent, sidebarContentAuxiliary } = i;
    return badgedAppIds.some((id) => {
      const appKey = PANELS.GENERIC_CONTENT_SIDEKICK + id;
      const isAppPanelOpened = (sidebarContent.isOpen === true && sidebarContent.sidebarContentPanel === appKey)
        || (sidebarContentAuxiliary.isOpen === true && sidebarContentAuxiliary.sidebarContentPanel === appKey);
      return Boolean(registeredApps?.[appKey])
        && !pinnedApps?.includes(appKey)
        && !isAppPanelOpened;
    });
  });

  useEffect(() => {
    // Close the gallery if its last app went away while it was open
    // (e.g. the user lost presenter/moderator role).
    if (hasApps || !isOpened) return undefined;
    const timer = setTimeout(closePanel, CLOSE_EMPTY_GALLERY_DELAY);
    return () => clearTimeout(timer);
  }, [hasApps, isOpened, closePanel]);

  if (!hasApps) return null;

  return (
    <SidebarNavigationButton
      panel={PANELS.APPS_GALLERY}
      isOpened={isOpened}
      iconName="widgets"
      label={label}
      id="apps-gallery-toggle-button"
      ariaDescribedBy="appsGallery"
      dataTest="appsGallerySidebarButton"
      hasNotification={hasHiddenAppBadge}
    />
  );
};

export default memo(AppsListItem);
