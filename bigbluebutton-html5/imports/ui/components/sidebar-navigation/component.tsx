import React, { useRef, useState, useEffect } from 'react';
import CustomLogo from './custom-logo/component';
import ProfileListItem from './profile-list-item/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { useIsChatEnabled } from '/imports/ui/services/features';
import ChatListItemContainer from './chat-list-item/container';
import UserNotesListItemContainer from './user-notes-list-item/component';
import UsersListItem from './users-list-item/component';
import AppsListItem from './apps-list-item/component';
import LearningDashboardListItem from './learning-dashboard-list-item/component';
import SettingsListItem from './settings-list-item/component';
import PinnedApps from './pinned-apps/component';
import { SidebarNavigation as SidebarNavigationInput } from '../layout/layoutTypes';
import Styled from './styles';

interface SidebarNavigationProps {
  isMobile: boolean,
  top: number,
  left?: number,
  right?: number,
  zIndex: number,
  height: number,
  width: number,
  sidebarNavigationInput: SidebarNavigationInput,
  isModerator: boolean,
}

const SidebarNavigation = ({
  isMobile,
  top,
  left = undefined,
  right = undefined,
  zIndex,
  height,
  width,
  sidebarNavigationInput,
  isModerator,
}: SidebarNavigationProps) => {
  const showBrandingArea = getFromUserSettings('bbb_display_branding_area', window.meetingClientSettings.public.app.branding.displayBrandingArea);
  const isChatEnabled = useIsChatEnabled();

  const scrollRef = useRef<HTMLDivElement>(null);
  const [hasScrollbar, setHasScrollbar] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const checkScrollbar = () => {
        setHasScrollbar(el.scrollHeight > el.clientHeight);
      };

      checkScrollbar();

      // Optionally watch resize
      const resizeObserver = new ResizeObserver(checkScrollbar);
      resizeObserver.observe(el);

      return () => resizeObserver.disconnect();
    }
    return () => {};
  }, []);

  return (
    <Styled.NavigationSidebarBackdrop
      isMobile={isMobile}
      style={{
        top,
        left,
        right,
        zIndex,
        height,
        width,
      }}
    >
      <Styled.NavigationSidebar data-test="navigationSidebarContainer" isMobile={isMobile}>
        <Styled.NavigationSidebarListItemsContainer
          ref={scrollRef}
          hasScrollbar={hasScrollbar}
        >
          <Styled.Top>
            {showBrandingArea && <CustomLogo />}
            <ProfileListItem />
            <UsersListItem />
            {isChatEnabled && <ChatListItemContainer />}
            <UserNotesListItemContainer />
          </Styled.Top>

          <Styled.Center>
            <AppsListItem />
            <PinnedApps
              sidebarNavigationInput={sidebarNavigationInput}
            />
          </Styled.Center>

          <Styled.Bottom>
            { isModerator ? <LearningDashboardListItem /> : null }
            <SettingsListItem />
          </Styled.Bottom>
        </Styled.NavigationSidebarListItemsContainer>
      </Styled.NavigationSidebar>
    </Styled.NavigationSidebarBackdrop>
  );
};

export default SidebarNavigation;
