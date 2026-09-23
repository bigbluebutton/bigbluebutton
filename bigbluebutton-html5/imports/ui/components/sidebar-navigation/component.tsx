import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  memo,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import CustomLogo from './custom-logo/component';
import getFromUserSettings from '/imports/ui/services/users-settings';
import PinnedApps from './pinned-apps/component';
import SIDEBAR_BUTTONS_REGISTRY, { PINNED_APPS_BUTTON_ID } from './buttons-registry';
import { SidebarNavigation as SidebarNavigationInput } from '../layout/layoutTypes';
import getSettingsSingletonInstance from '/imports/ui/services/settings';
import { PANELS } from '/imports/ui/components/layout/enums';
import { layoutSelectInput } from '/imports/ui/components/layout/context';
import { Input } from '/imports/ui/components/layout/layoutTypes';
import logger from '/imports/startup/client/logger';
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
  hasUnreadMessages,
  hasUnreadNotes,
}: SidebarNavigationProps) => {
  const intl = useIntl();
  const showBrandingArea = getFromUserSettings('bbb_display_branding_area', window.meetingClientSettings.public.app.branding.displayBrandingArea);
  const {
    top: topButtons = [],
    center: centerButtons = [],
    bottom: bottomButtons = [],
  } = window.meetingClientSettings.public.sidebarNavigation.buttons;

  const scrollRef = useRef<HTMLDivElement>(null);
  // Prevents vertical scrollbox background to be shown on dark mode when there is no scroll
  const [noVirtualScrollboxBackground, setNoVirtualScrollboxBackground] = useState(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(!isMobile);
  // Prevents scroll bar during sidebar navigation expand animation on mobile endpoints
  const [enableScrollBar, setEnableScrollBar] = useState<boolean>(!isMobile);
  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;
  const hasNotification = hasUnreadMessages || hasUnreadNotes;
  const { sidebarContentPanel } = layoutSelectInput((i: Input) => i.sidebarContent);

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
      if (!enableScrollBar) {
        setEnableScrollBar(true);
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
    // collapse the sidebar when the device becomes mobile (e.g. the window is
    // resized across the breakpoint): mounting on mobile already starts collapsed,
    // but without this the expanded rail carried over from desktop would overlay
    // the sidebar content and the media area.
    // Deliberately a separate effect depending on isMobile only, so it fires once
    // per device type change. Folding it into the effect above (which re-runs on
    // every isExpanded change) would collapse the rail right back each time the
    // user taps the toggle to expand it on mobile, breaking the toggle.
    if (isMobile) {
      setIsExpanded(false);
    }
  }, [isMobile]);

  useEffect(() => {
    if (!isMobile) return;
    const panelWasOpened = sidebarContentPanel !== PANELS.NONE;
    if (panelWasOpened) {
      setIsExpanded(false);
    }
  }, [sidebarContentPanel]);

  useEffect(() => {
    [...topButtons, ...centerButtons, ...bottomButtons].forEach((buttonId) => {
      if (buttonId === PINNED_APPS_BUTTON_ID) return;
      if (!SIDEBAR_BUTTONS_REGISTRY[buttonId]) {
        logger.warn({
          logCode: 'sidebar_navigation_unknown_button_id',
          extraInfo: { buttonId },
        }, `Sidebar navigation: unknown button id "${buttonId}" configured in settings.yml, it will not be rendered`);
      }
    });
    // Configured button ids come from static startup settings, validate once on mount.
  }, []);

  const renderButton = useCallback((buttonId: string) => {
    if (buttonId === PINNED_APPS_BUTTON_ID) {
      return (
        <PinnedApps
          key={buttonId}
          sidebarNavigationInput={sidebarNavigationInput}
        />
      );
    }

    const ButtonComponent = SIDEBAR_BUTTONS_REGISTRY[buttonId];
    if (!ButtonComponent) return null;

    return <ButtonComponent key={buttonId} />;
  }, [sidebarNavigationInput]);

  const hasTopContent = showBrandingArea || topButtons.length > 0;
  const hasCenterContent = centerButtons.length > 0;
  const hasBottomContent = bottomButtons.length > 0;

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
            {topButtons.map((buttonId) => renderButton(buttonId))}
          </Styled.Top>

          {hasTopContent && hasCenterContent && <Styled.Separator />}

          <Styled.Center>
            {centerButtons.map((buttonId) => renderButton(buttonId))}
          </Styled.Center>

          {hasCenterContent && hasBottomContent && <Styled.Separator />}

          <Styled.Bottom>
            {bottomButtons.map((buttonId) => renderButton(buttonId))}
          </Styled.Bottom>
        </Styled.NavigationSidebarListItemsContainer>
      </Styled.NavigationSidebar>
    </Styled.NavigationSidebarBackdrop>
  );
};

export default memo(SidebarNavigation);
