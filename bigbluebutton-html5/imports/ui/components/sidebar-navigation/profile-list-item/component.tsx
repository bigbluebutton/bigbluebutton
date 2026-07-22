import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '../../layout/enums';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import useIsSpecificPanelOpened from '../hooks/useIsSpecificPanelOpened';

const intlMessages = defineMessages({
  profileLabel: {
    id: 'app.userList.profileTitle',
    description: 'Title for the profile panel',
  },
});

const ProfileListItem: React.FC = () => {
  const intl = useIntl();
  const isOpened = useIsSpecificPanelOpened(PANELS.PROFILE);

  const label = intl.formatMessage(intlMessages.profileLabel);

  return (
    <SidebarNavigationButton
      panel={PANELS.PROFILE}
      isOpened={isOpened}
      iconName="profile"
      label={label}
      id="profile-toggle-button"
      ariaDescribedBy="profile"
      dataTest="profileSidebarButton"
    />
  );
};

export default memo(ProfileListItem);
