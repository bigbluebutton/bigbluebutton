import React from 'react';
import CustomLogo from './custom-logo/component';
import ProfileListItem from './profile-list-item/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { useIsChatEnabled } from '/imports/ui/services/features';
import ChatListItemContainer from './chat-list-item/container';
import UserNotesListItemContainer from './user-notes-list-item/component';
import UsersListItem from './users-list-item/component';
import WidgetsListItem from './widgets-list-item/component';
import PollsListItemContainer from './polls-list-item/container';
import BreakoutRoomsListItemContainer from './breakout-rooms-list-item/container';
import LearningDashboardListItem from './learning-dashboard-list-item/component';
import SettingsListItem from './settings-list-item/component';
import { User } from '/imports/ui/Types/user';
import useCurrentUser from '../../core/hooks/useCurrentUser';
import Styled from './styles';

interface SidebarNavigationProps {
  top: number,
  left?: number,
  right?: number,
  zIndex: number,
  height: number,
  width: number,
}

const SidebarNavigation = ({
  top,
  left = undefined,
  right = undefined,
  zIndex,
  height,
  width,
}: SidebarNavigationProps) => {
  const showBrandingArea = getFromUserSettings('bbb_display_branding_area', window.meetingClientSettings.public.app.branding.displayBrandingArea);
  const isChatEnabled = useIsChatEnabled();
  const { data: currentUser } = useCurrentUser((u: Partial<User>) => (
    {
      presenter: u.presenter,
      isModerator: u.isModerator,
    }
  ));

  const isPresenterOrMod = currentUser?.presenter || currentUser?.isModerator;

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
          { isPresenterOrMod && (
            <PollsListItemContainer
              isPresenter={Boolean(currentUser?.presenter)}
            />
          )}
          { isPresenterOrMod && <BreakoutRoomsListItemContainer /> }
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
