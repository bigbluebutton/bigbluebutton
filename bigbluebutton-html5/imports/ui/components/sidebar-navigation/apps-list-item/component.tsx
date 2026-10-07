import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '/imports/ui/components/layout/enums';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import { useGenericContentBadgeIds } from '/imports/ui/core/local-states/useGenericContentBadges';
import useIsSpecificPanelOpened from '../hooks/useIsSpecificPanelOpened';

const intlMessages = defineMessages({
  wigetsLabel: {
    id: 'app.userList.appsTitle',
    description: 'Title for the apps panel',
  },
});

const AppsListItem: React.FC = () => {
  const intl = useIntl();
  const isOpened = useIsSpecificPanelOpened(PANELS.APPS_GALLERY);
  const label = intl.formatMessage(intlMessages.wigetsLabel);
  const badgedAppIds = useGenericContentBadgeIds();

  // A pinned app shows the badge on its own button and an open one needs no
  // reminder, so only badges hidden inside the gallery count. Derived inside the
  // selector so that layout changes re-render this button only when it flips.
  const hasHiddenAppBadge = layoutSelectInput((i: Input) => {
    if (isOpened) return false;
    const { registeredApps, pinnedApps } = i.sidebarNavigation;
    const { sidebarContent, sidebarContentAuxiliary } = i;
    return badgedAppIds.some((id) => {
      const appKey = PANELS.GENERIC_CONTENT_SIDEKICK + id;
      const isAppPanelOpened = sidebarContent.sidebarContentPanel === appKey
        || (sidebarContentAuxiliary.isOpen === true && sidebarContentAuxiliary.sidebarContentPanel === appKey);
      return Boolean(registeredApps?.[appKey])
        && !pinnedApps?.includes(appKey)
        && !isAppPanelOpened;
    });
  });

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
