import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '/imports/ui/components/layout/enums';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
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

  return (
    <SidebarNavigationButton
      panel={PANELS.APPS_GALLERY}
      isOpened={isOpened}
      iconName="widgets"
      label={label}
      id="apps-gallery-toggle-button"
      ariaDescribedBy="appsGallery"
      dataTest="appsGallerySidebarButton"
    />
  );
};

export default memo(AppsListItem);
