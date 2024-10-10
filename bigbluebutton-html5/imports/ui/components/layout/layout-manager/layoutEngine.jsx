import React from 'react';
import { layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { LAYOUT_TYPE, DEVICE_TYPE } from '/imports/ui/components/layout/enums';

import CustomLayout from '/imports/ui/components/layout/layout-manager/customLayout';
import SmartLayout from '/imports/ui/components/layout/layout-manager/smartLayout';
import PresentationFocusLayout from '/imports/ui/components/layout/layout-manager/presentationFocusLayout';
import VideoFocusLayout from '/imports/ui/components/layout/layout-manager/videoFocusLayout';
import CamerasOnlyLayout from '/imports/ui/components/layout/layout-manager/camerasOnly';
import PresentationOnlyLayout from '/imports/ui/components/layout/layout-manager/presentationOnlyLayout';
import ParticipantsAndChatOnlyLayout from '/imports/ui/components/layout/layout-manager/participantsAndChatOnlyLayout';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import useSettings from '/imports/ui/services/settings/hooks/useSettings';
import { SETTINGS } from '/imports/ui/services/settings/enums';
import { useIsPresentationEnabled } from '/imports/ui/services/features';

const LayoutEngine = () => {
  const bannerBarInput = layoutSelectInput((i) => i.bannerBar);
  const notificationsBarInput = layoutSelectInput((i) => i.notificationsBar);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const presentationInput = layoutSelectInput((i) => i.presentation);
  const actionbarInput = layoutSelectInput((i) => i.actionBar);
  const navBarInput = layoutSelectInput((i) => i.navBar);
  const sidebarNavigationInput = layoutSelectInput((i) => i.sidebarNavigation);
  const sidebarContentInput = layoutSelectInput((i) => i.sidebarContent);
  const externalVideoInput = layoutSelectInput((i) => i.externalVideo);
  const genericMainContentInput = layoutSelectInput((i) => i.genericMainContent);
  const screenShareInput = layoutSelectInput((i) => i.screenShare);
  const sharedNotesInput = layoutSelectInput((i) => i.sharedNotes);

  const fullscreen = layoutSelect((i) => i.fullscreen);
  const Settings = getSettingsSingletonInstance();
  const { isRTL } = Settings.application;
  const fontSize = layoutSelect((i) => i.fontSize);
  const deviceType = layoutSelect((i) => i.deviceType);
  const { selectedLayout } = useSettings(SETTINGS.APPLICATION);
  const isPresentationEnabled = useIsPresentationEnabled();

  const isMobile = deviceType === DEVICE_TYPE.MOBILE;
  const isTablet = deviceType === DEVICE_TYPE.TABLET;
  const windowWidth = () => window.document.documentElement.clientWidth;
  const windowHeight = () => window.document.documentElement.clientHeight;
  const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
  const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

  const bannerAreaHeight = () => {
    const { hasNotification } = notificationsBarInput;
    const { hasBanner } = bannerBarInput;
    const bannerHeight = hasBanner ? DEFAULT_VALUES.bannerHeight : 0;
    const notificationHeight = hasNotification ? DEFAULT_VALUES.bannerHeight : 0;

    return bannerHeight + notificationHeight;
  };

  const baseCameraDockBounds = (mediaAreaBounds, sidebarSize) => {
    const { isOpen, slidesLength } = presentationInput;
    const { hasExternalVideo } = externalVideoInput;
    const { genericContentId } = genericMainContentInput;
    const { hasScreenShare } = screenShareInput;
    const { isPinned: isSharedNotesPinned } = sharedNotesInput;

    const cameraDockBounds = {};

    if (cameraDockInput.numCameras === 0 && selectedLayout !== LAYOUT_TYPE.VIDEO_FOCUS) {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;

      return cameraDockBounds;
    }

    const navBarHeight = calculatesNavbarHeight();
    const hasPresentation = isPresentationEnabled && slidesLength !== 0;
    const isGeneralMediaOff = !hasPresentation
      && !hasExternalVideo && !hasScreenShare
      && !isSharedNotesPinned && !genericContentId;

    if (!isOpen || isGeneralMediaOff) {
      cameraDockBounds.width = mediaAreaBounds.width;
      cameraDockBounds.maxWidth = mediaAreaBounds.width;
      cameraDockBounds.height = mediaAreaBounds.height - bannerAreaHeight();
      cameraDockBounds.maxHeight = mediaAreaBounds.height;
      cameraDockBounds.top = navBarHeight + bannerAreaHeight();
      cameraDockBounds.left = !isRTL ? mediaAreaBounds.left : 0;
      cameraDockBounds.right = isRTL ? sidebarSize : null;
    }

    if (fullscreen.group === 'webcams') {
      cameraDockBounds.width = windowWidth();
      cameraDockBounds.minWidth = windowWidth();
      cameraDockBounds.maxWidth = windowWidth();
      cameraDockBounds.height = windowHeight();
      cameraDockBounds.minHeight = windowHeight();
      cameraDockBounds.maxHeight = windowHeight();
      cameraDockBounds.top = 0;
      cameraDockBounds.left = 0;
      cameraDockBounds.right = 0;
      cameraDockBounds.zIndex = 99;

      return cameraDockBounds;
    }

    return cameraDockBounds;
  };

  const calculatesNavbarHeight = () => {
    const { navBarHeight } = DEFAULT_VALUES;

    return navBarInput.hasNavBar ? navBarHeight : 0;
  };

  const calculatesNavbarBounds = (mediaAreaBounds) => {
    const { navBarTop } = DEFAULT_VALUES;

    const navBarHeight = calculatesNavbarHeight();

    if (!navBarInput.hasNavBar) {
      return {
        width: 0,
        height: 0,
        top: 0,
        left: 0,
        zIndex: 0,
      };
    }

    return {
      width: mediaAreaBounds.width,
      height: navBarHeight,
      top: navBarTop + bannerAreaHeight(),
      left: !isRTL ? mediaAreaBounds.left : 0,
      zIndex: 1,
    };
  };

  const calculatesActionbarHeight = () => {
    if (!actionbarInput.hasActionBar) {
      return {
        height: 0,
        innerHeight: 0,
        padding: 0,
      };
    }

    const { actionBarHeight, actionBarPadding } = DEFAULT_VALUES;

    const BASE_FONT_SIZE = 14; // 90% font size
    const height = ((actionBarHeight / BASE_FONT_SIZE) * fontSize);

    return {
      height: height + (actionBarPadding * 2),
      innerHeight: height,
      padding: actionBarPadding,
    };
  };

  const calculatesActionbarBounds = (mediaAreaBounds) => {
    const actionBarHeight = calculatesActionbarHeight();

    return {
      display: actionbarInput.hasActionBar,
      width: mediaAreaBounds.width,
      height: actionBarHeight.height,
      innerHeight: actionBarHeight.innerHeight,
      padding: actionBarHeight.padding,
      top: windowHeight() - actionBarHeight.height,
      left: !isRTL ? mediaAreaBounds.left : 0,
      zIndex: 1,
    };
  };

  const calculatesSidebarNavWidth = () => {
    const {
      sidebarNavMinWidth,
      sidebarNavMaxWidth,
    } = DEFAULT_VALUES;

    const { isOpen, width: sidebarNavWidth } = sidebarNavigationInput;

    let minWidth = 0;
    let width = 0;
    let maxWidth = 0;
    if (isOpen) {
      if (isMobile) {
        minWidth = windowWidth();
        width = windowWidth();
        maxWidth = windowWidth();
      } else {
        if (sidebarNavWidth === 0) {
          width = min(max((windowWidth() * 0.2), sidebarNavMinWidth), sidebarNavMaxWidth);
        } else {
          width = min(max(sidebarNavWidth, sidebarNavMinWidth), sidebarNavMaxWidth);
        }
        minWidth = sidebarNavMinWidth;
        maxWidth = sidebarNavMaxWidth;
      }
    }
    return {
      minWidth,
      width,
      maxWidth,
    };
  };

  const calculatesSidebarNavHeight = () => {
    const { navBarHeight } = DEFAULT_VALUES;
    const { isOpen } = sidebarNavigationInput;

    let sidebarNavHeight = 0;
    if (isOpen) {
      if (isMobile) {
        sidebarNavHeight = windowHeight() - navBarHeight - bannerAreaHeight();
      } else {
        sidebarNavHeight = windowHeight() - bannerAreaHeight();
      }
    }
    return sidebarNavHeight;
  };

  const calculatesSidebarNavBounds = () => {
    const { sidebarNavTop, navBarHeight, sidebarNavLeft } = DEFAULT_VALUES;

    let top = sidebarNavTop + bannerAreaHeight();

    if (isMobile) {
      top = navBarHeight + bannerAreaHeight();
    }

    return {
      top,
      left: !isRTL ? sidebarNavLeft : null,
      right: isRTL ? sidebarNavLeft : null,
      zIndex: isMobile ? 11 : 2,
    };
  };

  const calculatesSidebarContentWidth = () => {
    const {
      sidebarContentMinWidth,
      sidebarContentMaxWidth,
    } = DEFAULT_VALUES;

    const { isOpen, width: sidebarContentWidth } = sidebarContentInput;

    let minWidth = 0;
    let width = 0;
    let maxWidth = 0;

    if (isOpen) {
      if (isMobile) {
        minWidth = windowWidth();
        width = windowWidth();
        maxWidth = windowWidth();
      } else {
        if (sidebarContentWidth === 0) {
          width = min(
            max((windowWidth() * 0.2), sidebarContentMinWidth), sidebarContentMaxWidth,
          );
        } else {
          width = min(max(sidebarContentWidth, sidebarContentMinWidth),
            sidebarContentMaxWidth);
        }
        minWidth = sidebarContentMinWidth;
        maxWidth = sidebarContentMaxWidth;
      }
    }
    return {
      minWidth,
      width,
      maxWidth,
    };
  };

  const calculatesSidebarContentBounds = (sidebarNavWidth) => {
    const { navBarHeight, sidebarNavTop } = DEFAULT_VALUES;

    let top = sidebarNavTop + bannerAreaHeight();

    if (isMobile) top = navBarHeight + bannerAreaHeight();

    let left = isMobile ? 0 : sidebarNavWidth;
    let right = isMobile ? 0 : sidebarNavWidth;
    left = !isRTL ? left : null;
    right = isRTL ? right : null;

    const zIndex = isMobile ? 11 : 1;

    return {
      top,
      left,
      right,
      zIndex,
    };
  };

  const calculatesMediaAreaBounds = (sidebarNavWidth, sidebarContentWidth) => {
    const { height: actionBarHeight } = calculatesActionbarHeight();
    const navBarHeight = calculatesNavbarHeight();

    let left = 0;
    let width = 0;
    if (isMobile) {
      width = windowWidth();
    } else {
      left = !isRTL ? sidebarNavWidth + sidebarContentWidth : 0;
      width = windowWidth() - sidebarNavWidth - sidebarContentWidth;
    }

    return {
      width,
      height: windowHeight() - (navBarHeight + actionBarHeight + bannerAreaHeight()),
      top: navBarHeight + bannerAreaHeight(),
      left,
    };
  };

  const common = {
    bannerAreaHeight,
    baseCameraDockBounds,
    calculatesNavbarHeight,
    calculatesNavbarBounds,
    calculatesActionbarHeight,
    calculatesActionbarBounds,
    calculatesSidebarNavWidth,
    calculatesSidebarNavHeight,
    calculatesSidebarNavBounds,
    calculatesSidebarContentWidth,
    calculatesSidebarContentBounds,
    calculatesMediaAreaBounds,
    isMobile,
    isTablet,
  };

  const layout = document.getElementById('layout');

  switch (selectedLayout) {
    case LAYOUT_TYPE.CUSTOM_LAYOUT:
      layout?.setAttribute('data-layout', LAYOUT_TYPE.CUSTOM_LAYOUT);
      return <CustomLayout {...common} isPresentationEnabled={isPresentationEnabled} />;
    case LAYOUT_TYPE.SMART_LAYOUT:
      layout?.setAttribute('data-layout', LAYOUT_TYPE.SMART_LAYOUT);
      return <SmartLayout {...common} isPresentationEnabled={isPresentationEnabled} />;
    case LAYOUT_TYPE.PRESENTATION_FOCUS:
      layout?.setAttribute('data-layout', LAYOUT_TYPE.PRESENTATION_FOCUS);
      return <PresentationFocusLayout {...common} isPresentationEnabled={isPresentationEnabled} />;
    case LAYOUT_TYPE.VIDEO_FOCUS:
      layout?.setAttribute('data-layout', LAYOUT_TYPE.VIDEO_FOCUS);
      return <VideoFocusLayout {...common} isPresentationEnabled={isPresentationEnabled} />;
    case LAYOUT_TYPE.CAMERAS_ONLY:
      layout?.setAttribute('data-layout', LAYOUT_TYPE.CAMERAS_ONLY);
      return <CamerasOnlyLayout {...common} />;
    case LAYOUT_TYPE.PRESENTATION_ONLY:
      layout?.setAttribute('data-layout', LAYOUT_TYPE.PRESENTATION_ONLY);
      return <PresentationOnlyLayout {...common} />;
    case LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY:
      layout?.setAttribute('data-layout', LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY);
      return <ParticipantsAndChatOnlyLayout {...common} />;
    default:
      layout?.setAttribute('data-layout', LAYOUT_TYPE.CUSTOM_LAYOUT);
      return <CustomLayout {...common} isPresentationEnabled={isPresentationEnabled} />;
  }
};

export default LayoutEngine;
