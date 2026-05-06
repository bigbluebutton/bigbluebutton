import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '../../layout/enums';
import { BaseSidebarButtonProps } from '../types';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';

const intlMessages = defineMessages({
  profileLabel: {
    id: 'app.userList.profileTitle',
    description: 'Title for the profile panel',
  },
});

const ProfileListItem: React.FC<BaseSidebarButtonProps> = ({ isOpened }) => {
  const intl = useIntl();

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
