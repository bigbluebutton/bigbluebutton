import React, { memo } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { PANELS } from '../../layout/enums';
import { BaseSidebarButtonProps } from '../types';
import SidebarNavigationButton from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/component';
import SidebarNavButtonStyled from '/imports/ui/components/sidebar-navigation/sidebar-navigation-button/styles';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const intlMessages = defineMessages({
  profileLabel: {
    id: 'app.userList.profileTitle',
    description: 'Title for the profile panel',
  },
});

const ProfileListItem: React.FC<BaseSidebarButtonProps> = ({ isOpened }) => {
  const intl = useIntl();
  const { data: currentUserData } = useCurrentUser((user) => ({ away: user.away }));
  const away = currentUserData?.away ?? false;

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
    >
      <SidebarNavButtonStyled.StatusDot away={away} />
    </SidebarNavigationButton>
  );
};

export default memo(ProfileListItem);
