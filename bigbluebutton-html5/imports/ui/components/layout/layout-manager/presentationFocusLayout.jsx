import { useEffect, useRef } from 'react';
import _ from 'lodash';
import { LayoutContextFunc } from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { INITIAL_INPUT_STATE } from '/imports/ui/components/layout/initState';
import { DEVICE_TYPE, ACTIONS, PANELS } from '/imports/ui/components/layout/enums';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;
const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

const PresentationFocusLayout = () => {
  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const { layoutContextSelector } = LayoutContextFunc;
  const layoutDispatch = layoutContextSelector.layoutDispatch();

  const input = layoutContextSelector.select((i) => i.input);
  const deviceType = layoutContextSelector.select((i) => i.deviceType);
  const isRTL = layoutContextSelector.select((i) => i.isRTL);
  const fullscreen = layoutContextSelector.select((i) => i.fullscreen);
  const fontSize = layoutContextSelector.select((i) => i.fontSize);
  const currentPanelType = layoutContextSelector.select((i) => i.currentPanelType);

  const bannerBarInput = layoutContextSelector.selectInput((i) => i.bannerBar);
  const notificationsBarInput = layoutContextSelector.selectInput((i) => i.notificationsBar);
  const presentationInput = layoutContextSelector.selectInput((i) => i.presentation);
  const sidebarNavigationInput = layoutContextSelector.selectInput((i) => i.sidebarNavigation);
  const sidebarContentInput = layoutContextSelector.selectInput((i) => i.sidebarContent);
  const cameraDockInput = layoutContextSelector.selectInput((i) => i.cameraDock);
  const actionbarInput = layoutContextSelector.selectInput((i) => i.actionBar);
  const navbarInput = layoutContextSelector.selectInput((i) => i.navBar);

  const prevDeviceType = usePrevious(deviceType);

  const throttledCalculatesLayout = _.throttle(() => calculatesLayout(),
    50, { trailing: true, leading: true });

  useEffect(() => {
    window.addEventListener('resize', () => {
      layoutDispatch({
        type: ACTIONS.SET_BROWSER_SIZE,
        value: {
          width: window.document.documentElement.clientWidth,
          height: window.document.documentElement.clientHeight,
        },
      });
    });
  }, []);

  useEffect(() => {
    if (deviceType === null) return;

    if (deviceType !== prevDeviceType) {
      // reset layout if deviceType changed
      // not all options is supported in all devices
      init();
    } else {
      throttledCalculatesLayout();
    }
  }, [input, deviceType]);

  const bannerAreaHeight = () => {
    const { hasNotification } = notificationsBarInput;
    const { hasBanner } = bannerBarInput;
    const bannerHeight = hasBanner ? DEFAULT_VALUES.bannerHeight : 0;
    const notificationHeight = hasNotification ? DEFAULT_VALUES.bannerHeight : 0;

    return bannerHeight + notificationHeight;
  };

  const init = () => {
    if (deviceType === DEVICE_TYPE.MOBILE) {
      layoutDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: _.defaultsDeep({
          sidebarNavigation: {
            isOpen: false,
            sidebarNavPanel: sidebarNavigationInput.sidebarNavPanel,
          },
          sidebarContent: {
            isOpen: false,
            sidebarContentPanel: sidebarContentInput.sidebarContentPanel,
          },
          SidebarContentHorizontalResizer: {
            isOpen: false,
          },
          presentation: {
            slidesLength: presentationInput.slidesLength,
            currentSlide: {
              ...presentationInput.currentSlide,
            },
          },
          cameraDock: {
            numCameras: cameraDockInput.numCameras,
          },
        }, INITIAL_INPUT_STATE),
      });
    } else {
      const { sidebarContentPanel } = sidebarContentInput;

      layoutDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: _.defaultsDeep({
          sidebarNavigation: {
            isOpen: true,
          },
          sidebarContent: {
            isOpen: sidebarContentPanel !== PANELS.NONE,
            sidebarContentPanel,
          },
          SidebarContentHorizontalResizer: {
            isOpen: false,
          },
          presentation: {
            slidesLength: presentationInput.slidesLength,
            currentSlide: {
              ...presentationInput.currentSlide,
            },
          },
          cameraDock: {
            numCameras: cameraDockInput.numCameras,
          },
        }, INITIAL_INPUT_STATE),
      });
    }
    throttledCalculatesLayout();
  };

  const calculatesNavbarBounds = (mediaAreaBounds) => {
    return {
      width: mediaAreaBounds.width,
      height: DEFAULT_VALUES.navBarHeight,
      top: DEFAULT_VALUES.navBarTop + bannerAreaHeight(),
      left: !isRTL ? mediaAreaBounds.left : 0,
      zIndex: 1,
    };
  }

  const calculatesActionbarHeight = () => {
    const BASE_FONT_SIZE = 14; // 90% font size
    const BASE_HEIGHT = DEFAULT_VALUES.actionBarHeight;
    const PADDING = DEFAULT_VALUES.actionBarPadding;

    const actionBarHeight = ((BASE_HEIGHT / BASE_FONT_SIZE) * fontSize);

    return {
      height: actionBarHeight + (PADDING * 2),
      innerHeight: actionBarHeight,
      padding: PADDING,
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
    let minWidth = 0;
    let width = 0;
    let maxWidth = 0;
    if (sidebarNavigationInput.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        minWidth = windowWidth();
        width = windowWidth();
        maxWidth = windowWidth();
      } else {
        if (sidebarNavigationInput.width === 0) {
          width = min(max((windowWidth() * 0.2), sidebarNavMinWidth), sidebarNavMaxWidth);
        } else {
          width = min(max(sidebarNavigationInput.width, sidebarNavMinWidth), sidebarNavMaxWidth);
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
    let sidebarNavHeight = 0;
    if (sidebarNavigationInput.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
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

    if (deviceType === DEVICE_TYPE.MOBILE) top = navBarHeight + bannerAreaHeight();

    return {
      top,
      left: !isRTL ? sidebarNavLeft : null,
      right: isRTL ? sidebarNavLeft : null,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 11 : 2,
    };
  };

  const calculatesSidebarContentWidth = () => {
    const {
      sidebarContentMinWidth,
      sidebarContentMaxWidth,
    } = DEFAULT_VALUES;
    let minWidth = 0;
    let width = 0;
    let maxWidth = 0;
    if (sidebarContentInput.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        minWidth = windowWidth();
        width = windowWidth();
        maxWidth = windowWidth();
      } else {
        if (sidebarContentInput.width === 0) {
          width = min(
            max((windowWidth() * 0.2), sidebarContentMinWidth), sidebarContentMaxWidth,
          );
        } else {
          width = min(max(sidebarContentInput.width, sidebarContentMinWidth),
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

  const calculatesSidebarContentHeight = () => {
    const {
      navBarHeight,
      sidebarContentMinHeight,
    } = DEFAULT_VALUES;
    let height = 0;
    let minHeight = 0;
    let maxHeight = 0;
    if (sidebarContentInput.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        height = windowHeight() - navBarHeight - bannerAreaHeight();
        minHeight = height;
        maxHeight = height;
      } else if (cameraDockInput.numCameras > 0) {
        if (sidebarContentInput.height === 0) {
          height = (windowHeight() * 0.75) - bannerAreaHeight();
        } else {
          height = min(max(sidebarContentInput.height, sidebarContentMinHeight),
            windowHeight());
        }
        minHeight = windowHeight() * 0.25 - bannerAreaHeight();
        maxHeight = windowHeight() * 0.75 - bannerAreaHeight();
      } else {
        height = windowHeight() - bannerAreaHeight();
        minHeight = height;
        maxHeight = height;
      }
    }
    return {
      height,
      minHeight,
      maxHeight,
    };
  };

  const calculatesSidebarContentBounds = (sidebarNavWidth) => {
    const { navBarHeight, sidebarNavTop } = DEFAULT_VALUES;

    let top = sidebarNavTop + bannerAreaHeight();

    if (deviceType === DEVICE_TYPE.MOBILE) top = navBarHeight + bannerAreaHeight();

    let left = deviceType === DEVICE_TYPE.MOBILE ? 0 : sidebarNavWidth;
    let right = deviceType === DEVICE_TYPE.MOBILE ? 0 : sidebarNavWidth;
    left = !isRTL ? left : null;
    right = isRTL ? right : null;

    const zIndex = deviceType === DEVICE_TYPE.MOBILE ? 11 : 1;

    return {
      top,
      left,
      right,
      zIndex,
    };
  };

  const calculatesMediaAreaBounds = (sidebarNavWidth, sidebarContentWidth) => {
    const { navBarHeight } = DEFAULT_VALUES;
    const { height: actionBarHeight } = calculatesActionbarHeight();
    let left = 0;
    let width = 0;
    if (deviceType === DEVICE_TYPE.MOBILE) {
      left = 0;
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

  const calculatesCameraDockBounds = (
    mediaBounds,
    mediaAreaBounds,
    sidebarNavWidth,
    sidebarContentWidth,
    sidebarContentHeight,
  ) => {
    const cameraDockBounds = {};

    if (cameraDockInput.numCameras > 0) {
      let cameraDockHeight = 0;

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

      if (deviceType === DEVICE_TYPE.MOBILE) {
        cameraDockBounds.top = mediaAreaBounds.top + mediaBounds.height;
        cameraDockBounds.left = 0;
        cameraDockBounds.right = 0;
        cameraDockBounds.minWidth = mediaAreaBounds.width;
        cameraDockBounds.width = mediaAreaBounds.width;
        cameraDockBounds.maxWidth = mediaAreaBounds.width;
        cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
        cameraDockBounds.height = mediaAreaBounds.height - mediaBounds.height;
        cameraDockBounds.maxHeight = mediaAreaBounds.height - mediaBounds.height;
      } else {
        if (cameraDockInput.height === 0) {
          cameraDockHeight = min(
            max((windowHeight() - sidebarContentHeight), DEFAULT_VALUES.cameraDockMinHeight),
            (windowHeight() - DEFAULT_VALUES.cameraDockMinHeight),
          );
        } else {
          cameraDockHeight = min(
            max(cameraDockInput.height, DEFAULT_VALUES.cameraDockMinHeight),
            (windowHeight() - DEFAULT_VALUES.cameraDockMinHeight),
          );
        }
        cameraDockBounds.top = windowHeight() - cameraDockHeight;
        cameraDockBounds.left = !isRTL ? sidebarNavWidth : 0;
        cameraDockBounds.right = isRTL ? sidebarNavWidth : 0;
        cameraDockBounds.minWidth = sidebarContentWidth;
        cameraDockBounds.width = sidebarContentWidth;
        cameraDockBounds.maxWidth = sidebarContentWidth;
        cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
        cameraDockBounds.height = cameraDockHeight;
        cameraDockBounds.maxHeight = windowHeight() - sidebarContentHeight;
        cameraDockBounds.zIndex = 1;
      }
    } else {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;
    }
    return cameraDockBounds;
  };

  const calculatesMediaBounds = (mediaAreaBounds, sidebarSize) => {
    const mediaBounds = {};
    const { element: fullscreenElement } = fullscreen;

    if (fullscreenElement === 'Presentation' || fullscreenElement === 'Screenshare') {
      mediaBounds.width = windowWidth();
      mediaBounds.height = windowHeight();
      mediaBounds.top = 0;
      mediaBounds.left = !isRTL ? 0 : null;
      mediaBounds.right = isRTL ? 0 : null;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    if (deviceType === DEVICE_TYPE.MOBILE && cameraDockInput.numCameras > 0) {
      mediaBounds.height = mediaAreaBounds.height * 0.7;
    } else {
      mediaBounds.height = mediaAreaBounds.height;
    }
    mediaBounds.width = mediaAreaBounds.width;
    mediaBounds.top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight();
    mediaBounds.left = !isRTL ? mediaAreaBounds.left : null;
    mediaBounds.right = isRTL ? sidebarSize : null;
    mediaBounds.zIndex = 1;

    return mediaBounds;
  };

  const calculatesLayout = () => {
    const { captionsMargin } = DEFAULT_VALUES;

    const sidebarNavWidth = calculatesSidebarNavWidth();
    const sidebarNavHeight = calculatesSidebarNavHeight();
    const sidebarContentWidth = calculatesSidebarContentWidth();
    const sidebarNavBounds = calculatesSidebarNavBounds();
    const sidebarContentBounds = calculatesSidebarContentBounds(sidebarNavWidth.width);
    const mediaAreaBounds = calculatesMediaAreaBounds(
      sidebarNavWidth.width, sidebarContentWidth.width,
    );
    const navbarBounds = calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = calculatesActionbarBounds(mediaAreaBounds);
    const sidebarSize = sidebarContentWidth.width + sidebarNavWidth.width;
    const mediaBounds = calculatesMediaBounds(mediaAreaBounds, sidebarSize);
    const sidebarContentHeight = calculatesSidebarContentHeight();
    const cameraDockBounds = calculatesCameraDockBounds(
      mediaBounds,
      mediaAreaBounds,
      sidebarNavWidth.width,
      sidebarContentWidth.width,
      sidebarContentHeight.height,
    );

    layoutDispatch({
      type: ACTIONS.SET_NAVBAR_OUTPUT,
      value: {
        display: navbarInput.hasNavBar,
        width: navbarBounds.width,
        height: navbarBounds.height,
        top: navbarBounds.top,
        left: navbarBounds.left,
        tabOrder: DEFAULT_VALUES.navBarTabOrder,
        zIndex: navbarBounds.zIndex,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_ACTIONBAR_OUTPUT,
      value: {
        display: actionbarInput.hasActionBar,
        width: actionbarBounds.width,
        height: actionbarBounds.height,
        innerHeight: actionbarBounds.innerHeight,
        top: actionbarBounds.top,
        left: actionbarBounds.left,
        padding: actionbarBounds.padding,
        tabOrder: DEFAULT_VALUES.actionBarTabOrder,
        zIndex: actionbarBounds.zIndex,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_CAPTIONS_OUTPUT,
      value: {
        left: !isRTL ? (mediaBounds.left + captionsMargin) : null,
        right: isRTL ? (mediaBounds.right + captionsMargin) : null,
        maxWidth: mediaBounds.width - (captionsMargin * 2),
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_OUTPUT,
      value: {
        display: sidebarNavigationInput.isOpen,
        minWidth: sidebarNavWidth.minWidth,
        width: sidebarNavWidth.width,
        maxWidth: sidebarNavWidth.maxWidth,
        height: sidebarNavHeight,
        top: sidebarNavBounds.top,
        left: sidebarNavBounds.left,
        right: sidebarNavBounds.right,
        tabOrder: DEFAULT_VALUES.sidebarNavTabOrder,
        isResizable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        zIndex: sidebarNavBounds.zIndex,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_RESIZABLE_EDGE,
      value: {
        top: false,
        right: !isRTL,
        bottom: false,
        left: isRTL,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_OUTPUT,
      value: {
        display: sidebarContentInput.isOpen,
        minWidth: sidebarContentWidth.minWidth,
        width: sidebarContentWidth.width,
        maxWidth: sidebarContentWidth.maxWidth,
        minHeight: sidebarContentHeight.minHeight,
        height: sidebarContentHeight.height,
        maxHeight: sidebarContentHeight.maxHeight,
        top: sidebarContentBounds.top,
        left: sidebarContentBounds.left,
        right: sidebarContentBounds.right,
        currentPanelType,
        tabOrder: DEFAULT_VALUES.sidebarContentTabOrder,
        isResizable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        zIndex: sidebarContentBounds.zIndex,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE,
      value: {
        top: false,
        right: !isRTL,
        bottom: cameraDockInput.numCameras > 0,
        left: isRTL,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_MEDIA_AREA_SIZE,
      value: {
        width: mediaAreaBounds.width,
        height: mediaAreaBounds.height,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_OUTPUT,
      value: {
        display: cameraDockInput.numCameras > 0,
        minWidth: cameraDockBounds.minWidth,
        width: cameraDockBounds.width,
        maxWidth: cameraDockBounds.maxWidth,
        minHeight: cameraDockBounds.minHeight,
        height: cameraDockBounds.height,
        maxHeight: cameraDockBounds.maxHeight,
        top: cameraDockBounds.top,
        left: cameraDockBounds.left,
        right: cameraDockBounds.right,
        tabOrder: 4,
        isDraggable: false,
        resizableEdge: {
          top: false,
          right: false,
          bottom: false,
          left: false,
        },
        zIndex: cameraDockBounds.zIndex,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: presentationInput.isOpen,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right : null,
        tabOrder: DEFAULT_VALUES.presentationTabOrder,
        isResizable: false,
        zIndex: mediaBounds.zIndex,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_SCREEN_SHARE_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: mediaBounds.right,
        zIndex: mediaBounds.zIndex,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_EXTERNAL_VIDEO_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: mediaBounds.right,
      },
    });
  };

  return null;
};

export default PresentationFocusLayout;
