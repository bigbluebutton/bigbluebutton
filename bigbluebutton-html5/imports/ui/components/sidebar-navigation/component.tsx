import React from 'react';
import CustomLogo from './custom-logo/component';
import ProfileListItem from './profile-list-item/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { useIsChatEnabled } from '/imports/ui/services/features';
import ChatListItemContainer from './chat-list-item/container';
import UserNotesListItemContainer from './user-notes-list-item/component';
import UsersListItem from './users-list-item/component';
import WidgetsListItem from './widgets-list-item/component';
import LearningDashboardListItem from './learning-dashboard-list-item/component';
import SettingsListItem from './settings-list-item/component';
import PinnedWidgets from './pinned-widgets/component';
import { SidebarNavigation as SidebarNavigationInput } from '../layout/layoutTypes';
import Styled from './styles';

interface SidebarNavigationProps {
  top: number,
  left?: number,
  right?: number,
  zIndex: number,
  height: number,
  width: number,
  sidebarNavigationInput: SidebarNavigationInput,
}

const SidebarNavigation = ({
  top,
  left = undefined,
  right = undefined,
  zIndex,
  height,
  width,
  sidebarNavigationInput,
}: SidebarNavigationProps) => {
  const showBrandingArea = getFromUserSettings('bbb_display_branding_area', window.meetingClientSettings.public.app.branding.displayBrandingArea);
  const isChatEnabled = useIsChatEnabled();

  return (
    <Styled.NavigationSidebar
      style={{
        top,
        left,
        right,
        zIndex,
        height,
        width,
      }}
    >
      <Styled.NavigationSidebarListItemsContainer>
        <Styled.Top>
          {showBrandingArea && <CustomLogo />}
          <ProfileListItem />
          <UsersListItem />
          {isChatEnabled && <ChatListItemContainer />}
          <UserNotesListItemContainer />
        </Styled.Top>

        <Styled.Center>
          <WidgetsListItem />
          <PinnedWidgets
            sidebarNavigationInput={sidebarNavigationInput}
          />
        </Styled.Center>

        <Styled.Bottom>
          <LearningDashboardListItem />
          <SettingsListItem />
        </Styled.Bottom>
      </Styled.NavigationSidebarListItemsContainer>
    </Styled.NavigationSidebar>
  );
};

export default SidebarNavigation;
