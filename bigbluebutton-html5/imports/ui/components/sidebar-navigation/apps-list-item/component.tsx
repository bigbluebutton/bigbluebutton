import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '/imports/ui/components/layout/enums';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import { BaseSidebarButtonProps } from '../types';

const intlMessages = defineMessages({
  wigetsLabel: {
    id: 'app.userList.appsTitle',
    description: 'Title for the apps panel',
  },
});

const AppsListItem: React.FC<BaseSidebarButtonProps> = ({ isOpened }) => {
  const intl = useIntl();
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
