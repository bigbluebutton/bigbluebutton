import { useEffect, useRef, useState } from 'react';
import { layoutDispatch, layoutSelect, layoutSelectInput } from './context';
import {
  ACTIONS, DEVICE_TYPE, LAYOUT_TYPE, PANELS,
} from './enums';
import {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
} from './utils';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import { Input, Layout } from './layoutTypes';
import { throttle } from '/imports/utils/throttle';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import getFromUserSettings from '/imports/ui/services/users-settings';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import MediaService from '/imports/ui/components/media/service';
import { useVideoStreams, useVideoStreamsCount } from '/imports/ui/components/video-provider/hooks';
import { useIsChatEnabled, useIsPresentationEnabled, useIsScreenSharingEnabled } from '/imports/ui/services/features';
import useUserChangedLocalSettings from '/imports/ui/services/settings/hooks/useUserChangedLocalSettings';
import Session from '/imports/ui/services/storage/in-memory';
import deviceInfo from '/imports/utils/deviceInfo';

const MOBILE_MEDIA = 'only screen and (max-width: 40em)';

const LayoutObserver: React.FC = () => {
  const layoutType = useRef<string | null>(null);
  const checkedUserSettings = useRef(false);
  const layoutContextDispatch = layoutDispatch();
  const deviceType = layoutSelect((i: Layout) => i.deviceType);
  const cameraDockInput = layoutSelectInput((i: Input) => i.cameraDock);
  const sidebarContentInput = layoutSelectInput((i: Input) => i.sidebarContent);
  const presentationInput = layoutSelectInput((i: Input) => i.presentation);
  const sharedNotesInput = layoutSelectInput((i: Input) => i.sharedNotes);
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;

  const [, setEnableResize] = useState(!window.matchMedia(MOBILE_MEDIA).matches);
  const { selectedLayout } = useSettings(SETTINGS.APPLICATION) as { selectedLayout: string };
  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    layout: m.layout,
    componentsFlags: m.componentsFlags,
  }));

  const isThereWebcam = useVideoStreamsCount() > 0;
  const { streams: videoStream } = useVideoStreams();
  const isScreenSharingEnabled = useIsScreenSharingEnabled();
  const isPresentationEnabled = useIsPresentationEnabled();
  const isChatEnabled = useIsChatEnabled();

  const setLocalSettings = useUserChangedLocalSettings();

  const { numCameras } = cameraDockInput;
  const { isOpen: sidebarContentIsOpen } = sidebarContentInput;
  const { isOpen: presentationIsOpen } = presentationInput;

  const { currentLayoutType } = currentMeeting?.layout || {};
  const meetingLayout = currentLayoutType && LAYOUT_TYPE[currentLayoutType as keyof typeof LAYOUT_TYPE];
  const isSharingVideo = currentMeeting?.componentsFlags?.hasExternalVideo;

  const setDeviceType = () => {
    let newDeviceType = null;
    if (isMobile()) newDeviceType = DEVICE_TYPE.MOBILE;
    if (isTablet()) newDeviceType = DEVICE_TYPE.TABLET;
    if (isTabletPortrait()) newDeviceType = DEVICE_TYPE.TABLET_PORTRAIT;
    if (isTabletLandscape()) newDeviceType = DEVICE_TYPE.TABLET_LANDSCAPE;
    if (isDesktop()) newDeviceType = DEVICE_TYPE.DESKTOP;

    if (newDeviceType !== deviceType) {
      layoutContextDispatch({
        type: ACTIONS.SET_DEVICE_TYPE,
        value: newDeviceType,
      });
    }
  };

  const throttledDeviceType = throttle(
    () => setDeviceType(),
    50, { trailing: true, leading: true },
  );

  useEffect(() => {
    const Settings = getSettingsSingletonInstance();

    layoutContextDispatch({
      type: ACTIONS.SET_IS_RTL,
      value: document.documentElement.getAttribute('dir') === 'rtl',
    });

    const APP_CONFIG = window.meetingClientSettings.public.app;
    const DESKTOP_FONT_SIZE = APP_CONFIG.desktopFontSize;
    const MOBILE_FONT_SIZE = APP_CONFIG.mobileFontSize;
    const fontSize = isMobile() ? MOBILE_FONT_SIZE : DESKTOP_FONT_SIZE;
    document.getElementsByTagName('html')[0].style.fontSize = fontSize;

    layoutContextDispatch({
      type: ACTIONS.SET_FONT_SIZE,
      value: parseInt(fontSize.slice(0, -2), 10),
    });

    layoutContextDispatch({
      type: ACTIONS.SET_HAS_ACTIONBAR,
      value: !getFromUserSettings('bbb_hide_actions_bar', false),
    });

    layoutContextDispatch({
      type: ACTIONS.SET_HAS_NAVBAR,
      value: !getFromUserSettings('bbb_hide_nav_bar', false),
    });

    window.addEventListener('localeChanged', () => {
      layoutContextDispatch({
        type: ACTIONS.SET_IS_RTL,
        value: Settings.application.isRTL,
      });
    });

    const handleWindowResize = throttle(() => {
      setEnableResize((enableResize) => {
        const shouldEnableResize = !window.matchMedia(MOBILE_MEDIA).matches;
        if (enableResize === shouldEnableResize) return enableResize;
        return shouldEnableResize;
      });
      throttledDeviceType();
    });

    handleWindowResize();
    window.addEventListener('resize', handleWindowResize, false);

    return () => {
      window.removeEventListener('resize', handleWindowResize, false);
    };
  }, []);

  useEffect(() => {
    const CHAT_CONFIG = window.meetingClientSettings.public.chat;
    const PUBLIC_CHAT_ID = CHAT_CONFIG.public_group_id;

    if (
      selectedLayout?.toLowerCase?.()?.includes?.('focus')
      && !sidebarContentIsOpen
      && deviceType !== DEVICE_TYPE.MOBILE
      && numCameras > 0
      && presentationIsOpen
    ) {
      setTimeout(() => {
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
          value: true,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_ID_CHAT_OPEN,
          value: PUBLIC_CHAT_ID,
        });
        layoutContextDispatch({
          type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
          value: PANELS.CHAT,
        });
      }, 0);
    }
  }, [selectedLayout]);

  useEffect(() => {
    throttledDeviceType();
  }, [deviceType]);

  useEffect(() => {
    if (
      layoutContextDispatch
      && (typeof meetingLayout !== 'undefined')
      && (layoutType.current !== meetingLayout)
      && sharedNotesInput?.isPinned
    ) {
      layoutType.current = meetingLayout;
      layoutContextDispatch({
        type: ACTIONS.SET_PRESENTATION_IS_OPEN,
        value: true,
      });
    }
  }, [meetingLayout, layoutContextDispatch, layoutType]);

  useEffect(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_TYPE,
      value: selectedLayout,
    });
  }, [selectedLayout]);

  useEffect(() => {
    MediaService.buildLayoutWhenPresentationAreaIsDisabled(
      layoutContextDispatch,
      isSharingVideo,
      sharedNotesInput?.isPinned,
      isThereWebcam,
      isScreenSharingEnabled,
      isPresentationEnabled,
    );
  });

  useEffect(() => {
    layoutContextDispatch({
      type: ACTIONS.SET_NUM_CAMERAS,
      value: videoStream.length,
    });
  }, [videoStream.length]);

  useEffect(() => {
    if (Session.equals('layoutReady', true) && (sidebarContentPanel === PANELS.NONE)) {
      if (!checkedUserSettings.current) {
        const showAnimationsDefault = getFromUserSettings(
          'bbb_show_animations_default',
          window.meetingClientSettings.public.app.defaultSettings.application.animations,
        );

        const Settings = getSettingsSingletonInstance();
        Settings.application.animations = showAnimationsDefault;
        Settings.save(setLocalSettings);

        if (getFromUserSettings('bbb_show_participants_on_login', window.meetingClientSettings.public.layout.showParticipantsOnLogin) && !deviceInfo.isPhone) {
          if (isChatEnabled && getFromUserSettings('bbb_show_public_chat_on_login', !window.meetingClientSettings.public.chat.startClosed)) {
            const PUBLIC_CHAT_ID = window.meetingClientSettings.public.chat.public_group_id;

            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.CHAT,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_ID_CHAT_OPEN,
              value: PUBLIC_CHAT_ID,
            });
          } else {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
              value: true,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
          }
        } else {
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
            value: false,
          });
          layoutContextDispatch({
            type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
            value: false,
          });
        }

        checkedUserSettings.current = true;
      }
    }
  });

  return null;
};

export default LayoutObserver;
