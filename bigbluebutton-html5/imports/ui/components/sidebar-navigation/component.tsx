import React, {
  useRef,
  useState,
  useEffect,
  memo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import CustomLogo from './custom-logo/component';
import ProfileListItem from './profile-list-item/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import ChatListItem from './chat-list-item/component';
import UserNotesListItemContainer from './user-notes-list-item/component';
import UsersListItem from './users-list-item/component';
import AppsListItem from './apps-list-item/component';
import AudioCaptionsListItem from './audio-captions-list-item/component';
import LearningDashboardListItem from './learning-dashboard-list-item/component';
import SettingsListItem from './settings-list-item/component';
import PinnedApps from './pinned-apps/component';
import { SidebarNavigation as SidebarNavigationInput } from '../layout/layoutTypes';
import getSettingsSingletonInstance from '/imports/ui/services/settings';
import { useIsLearningDashboardEnabled } from '/imports/ui/services/features';
import { PANELS } from '/imports/ui/components/layout/enums';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import useIsPanelOpened from './hooks/useIsPanelOpened';
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
  hasUnreadMessages: boolean,
  hasUnreadNotes: boolean,
}

const intlMessages = defineMessages({
  toggleSidebarNavigationLabel: {
    id: 'app.sidebarNavigation.toggle.btnLabel',
    description: 'Toggle sidebar navigation button label',
  },
  toggleSidebarNavigationAria: {
    id: 'app.sidebarNavigation.toggle.ariaLabel',
    description: 'description of the sidebar navigation toggle',
  },
  newMessages: {
    id: 'app.sidebarNavigation.toggle.newMessages',
    description: 'label for toggle sidebar navigation btn when showing red notification',
  },
  newMsgAria: {
    id: 'app.sidebarNavigation.toggle.newMsgAria',
    description: 'label for new message screen reader alert',
  },
});

const CSS_ANIMATION_DURATION_MS = 200;

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
  hasUnreadMessages,
  hasUnreadNotes,
}: SidebarNavigationProps) => {
  const intl = useIntl();
  const showBrandingArea = getFromUserSettings('bbb_display_branding_area', window.meetingClientSettings.public.app.branding.displayBrandingArea);

  const scrollRef = useRef<HTMLDivElement>(null);
  // Prevents vertical scrollbox background to be shown on dark mode when there is no scroll
  const [noVirtualScrollboxBackground, setNoVirtualScrollboxBackground] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(!isMobile);
  // Prevents scroll bar during sidebar navigation expand animation on mobile endpoints
  const [enableScrollBar, setEnableScrollBar] = useState<boolean>(!isMobile);
  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;
  const hasNotification = hasUnreadMessages || hasUnreadNotes;
  const isLearningDashboardEnabled = useIsLearningDashboardEnabled();
  const { sidebarContentPanel } = layoutSelectInput((i: Input) => i.sidebarContent);
  const isOpened = useIsPanelOpened();

  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      const checkScrollbar = () => {
        setNoVirtualScrollboxBackground(el.scrollHeight <= el.clientHeight);
      };

      checkScrollbar();

      // Optionally watch resize
      const resizeObserver = new ResizeObserver(checkScrollbar);
      resizeObserver.observe(el);

      return () => resizeObserver.disconnect();
    }
    return () => {};
  }, []);

  useEffect(() => {
    if (!isMobile) {
      if (!isExpanded) {
        // restore sidebar expanded state if device is not mobile anymore
        setIsExpanded(true);
      }
      return;
    }

    if (isExpanded !== enableScrollBar) {
      if (isExpanded) {
        setTimeout(() => setEnableScrollBar(true), CSS_ANIMATION_DURATION_MS);
      } else {
        setEnableScrollBar(false);
      }
    }
  }, [isExpanded, isMobile, enableScrollBar]);

  useEffect(() => {
    if (!isMobile) return;
    const panelWasOpened = sidebarContentPanel !== PANELS.NONE;
    if (panelWasOpened) {
      setIsExpanded(false);
    }
  }, [sidebarContentPanel]);

  return (
    <Styled.NavigationSidebarBackdrop
      isMobile={isMobile}
      isExpanded={isExpanded}
      style={{
        top,
        left,
        right,
        zIndex,
        height: isExpanded ? height : '0',
        width,
      }}
      animations={animations}
    >
      <Styled.NavigationSidebar
        isExpanded={isExpanded}
        data-test="navigationSidebarContainer"
        isMobile={isMobile}
        animations={animations}
      >
        {isMobile && (
          <Styled.NavigationToggleButton
            tooltipplacement="right"
            onClick={() => setIsExpanded((current) => !current)}
            color="primary"
            size="md"
            circle
            hideLabel
            hasNotification={hasNotification}
            data-test={hasNotification ? 'hasUnreadMessages' : 'toggleSidebarNavigation'}
            tooltipLabel={intl.formatMessage(intlMessages.toggleSidebarNavigationLabel)}
            aria-label={intl.formatMessage(hasNotification
              ? intlMessages.newMsgAria
              : intlMessages.toggleSidebarNavigationAria)}
            icon={isExpanded ? 'menu_up' : 'menu_down'}
            aria-expanded={isExpanded}
          />
        )}
        <Styled.NavigationSidebarListItemsContainer
          ref={scrollRef}
          isMobile={isMobile}
          noVirtualScrollboxBackground={noVirtualScrollboxBackground}
          isExpanded={isExpanded}
          animations={animations}
          enableScrollBar={enableScrollBar}
        >
          <Styled.Top>
            {showBrandingArea && <CustomLogo />}
            <ProfileListItem isOpened={isOpened(PANELS.PROFILE)} />
            <UsersListItem isOpened={isOpened(PANELS.USERLIST)} />
            <ChatListItem isOpened={isOpened(PANELS.CHAT)} />
            <UserNotesListItemContainer isOpened={isOpened(PANELS.SHARED_NOTES)} />
          </Styled.Top>

          <Styled.Center>
            <AppsListItem isOpened={isOpened(PANELS.APPS_GALLERY)} />
            <PinnedApps
              sidebarNavigationInput={sidebarNavigationInput}
            />
          </Styled.Center>

          <Styled.Bottom>
            <AudioCaptionsListItem isOpened={isOpened(PANELS.AUDIO_CAPTIONS)} />
            { isLearningDashboardEnabled && isModerator ? <LearningDashboardListItem /> : null }
            <SettingsListItem />
          </Styled.Bottom>
        </Styled.NavigationSidebarListItemsContainer>
      </Styled.NavigationSidebar>
    </Styled.NavigationSidebarBackdrop>
  );
};

export default memo(SidebarNavigation);
