import { useEffect, useRef } from 'react';
import _ from 'lodash';
import { LayoutContextFunc } from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { INITIAL_INPUT_STATE } from '/imports/ui/components/layout/initState';
import {
  DEVICE_TYPE, ACTIONS, CAMERADOCK_POSITION, PANELS,
} from '../enums';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;
const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

const CustomLayout = () => {
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
    50, { 'trailing': true, 'leading': true });

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

  const calculatesDropAreas = (sidebarNavWidth, sidebarContentWidth, cameraDockBounds) => {
    const { height: actionBarHeight } = calculatesActionbarHeight();
    const mediaAreaHeight = windowHeight()
      - (DEFAULT_VALUES.navBarHeight + actionBarHeight);
    const mediaAreaWidth = windowWidth() - (sidebarNavWidth + sidebarContentWidth);
    const DROP_ZONE_DEFAUL_SIZE = 100;
    const dropZones = {};
    const sidebarSize = sidebarNavWidth + sidebarContentWidth;

    dropZones[CAMERADOCK_POSITION.CONTENT_TOP] = {
      top: DEFAULT_VALUES.navBarHeight,
      left: !isRTL ? sidebarSize : null,
      right: isRTL ? sidebarSize : null,
      width: mediaAreaWidth,
      height: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    dropZones[CAMERADOCK_POSITION.CONTENT_RIGHT] = {
      top: DEFAULT_VALUES.navBarHeight + DROP_ZONE_DEFAUL_SIZE,
      left: !isRTL ? windowWidth() - DROP_ZONE_DEFAUL_SIZE : 0,
      height: mediaAreaHeight
        - (2 * DROP_ZONE_DEFAUL_SIZE),
      width: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    dropZones[CAMERADOCK_POSITION.CONTENT_BOTTOM] = {
      top: DEFAULT_VALUES.navBarHeight
        + mediaAreaHeight
        - DROP_ZONE_DEFAUL_SIZE,
      left: !isRTL ? sidebarSize : null,
      right: isRTL ? sidebarSize : null,
      width: mediaAreaWidth,
      height: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    dropZones[CAMERADOCK_POSITION.CONTENT_LEFT] = {
      top: DEFAULT_VALUES.navBarHeight + DROP_ZONE_DEFAUL_SIZE,
      left: !isRTL ? sidebarSize : null,
      right: isRTL ? sidebarSize : null,
      height: mediaAreaHeight
        - (2 * DROP_ZONE_DEFAUL_SIZE),
      width: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    dropZones[CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM] = {
      top: windowHeight() - DROP_ZONE_DEFAUL_SIZE,
      left: !isRTL ? sidebarNavWidth : null,
      right: isRTL ? sidebarNavWidth : null,
      width: sidebarContentWidth,
      height: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    return dropZones;
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
          sidebarContentHorizontalResizer: {
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
          sidebarContentHorizontalResizer: {
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
    } else {
      minWidth = 0;
      width = 0;
      maxWidth = 0;
    }
    return {
      minWidth,
      width,
      maxWidth,
    };
  };

  const calculatesSidebarNavHeight = () => {
    let sidebarNavHeight = 0;
    if (sidebarNavigationInput.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        sidebarNavHeight = windowHeight() - DEFAULT_VALUES.navBarHeight;
      } else {
        sidebarNavHeight = windowHeight();
      }
      sidebarNavHeight -= bannerAreaHeight();
    }
    return sidebarNavHeight;
  };

  const calculatesSidebarNavBounds = () => {
    const { sidebarNavTop, navBarHeight, sidebarNavLeft } = DEFAULT_VALUES;

    let top = sidebarNavTop + bannerAreaHeight();

    if (deviceType === DEVICE_TYPE.MOBILE) {
      top = navBarHeight + bannerAreaHeight();
    }

    return {
      top,
      left: !isRTL ? sidebarNavLeft : null,
      right: isRTL ? sidebarNavLeft : null,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 10 : 2,
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
    } else {
      minWidth = 0;
      width = 0;
      maxWidth = 0;
    }

    return {
      minWidth,
      width,
      maxWidth,
    };
  };

  const calculatesSidebarContentHeight = (cameraDockHeight) => {
    const { isOpen } = presentationInput;
    let sidebarContentHeight = 0;
    if (sidebarContentInput.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        sidebarContentHeight = windowHeight() - DEFAULT_VALUES.navBarHeight;
      } else if (cameraDockInput.numCameras > 0
        && cameraDockInput.position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM
        && isOpen) {
        sidebarContentHeight = windowHeight() - cameraDockHeight;
      } else {
        sidebarContentHeight = windowHeight();
      }
      sidebarContentHeight -= bannerAreaHeight();
    }
    return sidebarContentHeight;
  };

  const calculatesSidebarContentBounds = (sidebarNavWidth) => {
    let top = DEFAULT_VALUES.sidebarNavTop + bannerAreaHeight();

    if (deviceType === DEVICE_TYPE.MOBILE) {
      top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight();
    }

    let left = deviceType === DEVICE_TYPE.MOBILE ? 0 : sidebarNavWidth;
    left = !isRTL ? left : null;

    let right = deviceType === DEVICE_TYPE.MOBILE ? 0 : sidebarNavWidth;
    right = isRTL ? right : null;

    return {
      top,
      left,
      right,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 11 : 1,
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
      top: DEFAULT_VALUES.navBarHeight + bannerAreaHeight(),
      left,
    };
  };

  const calculatesCameraDockBounds = (sidebarNavWidth, sidebarContentWidth, mediaAreaBounds) => {
    const { isOpen } = presentationInput;
    const { camerasMargin } = DEFAULT_VALUES;
    const sidebarSize = sidebarNavWidth + sidebarContentWidth;

    const cameraDockBounds = {};

    if (cameraDockInput.numCameras > 0) {
      if (!isOpen) {
        cameraDockBounds.width = mediaAreaBounds.width;
        cameraDockBounds.maxWidth = mediaAreaBounds.width;
        cameraDockBounds.height = mediaAreaBounds.height;
        cameraDockBounds.maxHeight = mediaAreaBounds.height;
        cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
        cameraDockBounds.left = !isRTL ? mediaAreaBounds.left : 0;
        cameraDockBounds.right = isRTL ? sidebarSize : null;
      } else {
        let cameraDockLeft = 0;
        let cameraDockHeight = 0;
        let cameraDockWidth = 0;
        switch (cameraDockInput.position) {
          case CAMERADOCK_POSITION.CONTENT_TOP: {
            cameraDockLeft = mediaAreaBounds.left;

            if (cameraDockInput.height === 0 || deviceType === DEVICE_TYPE.MOBILE) {
              if (presentationInput.isOpen) {
                cameraDockHeight = min(
                  max((mediaAreaBounds.height * 0.2), DEFAULT_VALUES.cameraDockMinHeight),
                  (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight),
                );
              } else {
                cameraDockHeight = mediaAreaBounds.height;
              }
            } else {
              cameraDockHeight = min(
                max(cameraDockInput.height, DEFAULT_VALUES.cameraDockMinHeight),
                (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight),
              );
            }

            cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
            cameraDockBounds.left = cameraDockLeft;
            cameraDockBounds.right = isRTL ? sidebarSize : null;
            cameraDockBounds.minWidth = mediaAreaBounds.width;
            cameraDockBounds.width = mediaAreaBounds.width;
            cameraDockBounds.maxWidth = mediaAreaBounds.width;
            cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
            cameraDockBounds.height = cameraDockHeight - camerasMargin;
            cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.8;
            break;
          }
          case CAMERADOCK_POSITION.CONTENT_RIGHT: {
            if (cameraDockInput.width === 0) {
              if (presentationInput.isOpen) {
                cameraDockWidth = min(
                  max((mediaAreaBounds.width * 0.2), DEFAULT_VALUES.cameraDockMinWidth),
                  (mediaAreaBounds.width - DEFAULT_VALUES.cameraDockMinWidth),
                );
              } else {
                cameraDockWidth = mediaAreaBounds.width;
              }
            } else {
              cameraDockWidth = min(
                max(cameraDockInput.width, DEFAULT_VALUES.cameraDockMinWidth),
                (mediaAreaBounds.width - DEFAULT_VALUES.cameraDockMinWidth),
              );
            }

            cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
            const sizeValue = presentationInput.isOpen
              ? (mediaAreaBounds.left + mediaAreaBounds.width) - cameraDockWidth
              : mediaAreaBounds.left;
            cameraDockBounds.left = !isRTL ? sizeValue + camerasMargin : 0;
            cameraDockBounds.right = isRTL ? sizeValue + sidebarSize + camerasMargin : null;
            cameraDockBounds.minWidth = DEFAULT_VALUES.cameraDockMinWidth;
            cameraDockBounds.width = cameraDockWidth - (camerasMargin * 2);
            cameraDockBounds.maxWidth = mediaAreaBounds.width * 0.8;
            cameraDockBounds.presenterMaxWidth = mediaAreaBounds.width
              - DEFAULT_VALUES.presentationToolbarMinWidth
              - camerasMargin;
            cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
            cameraDockBounds.height = mediaAreaBounds.height;
            cameraDockBounds.maxHeight = mediaAreaBounds.height;
            break;
          }
          case CAMERADOCK_POSITION.CONTENT_BOTTOM: {
            cameraDockLeft = mediaAreaBounds.left;

            if (cameraDockInput.height === 0) {
              if (presentationInput.isOpen) {
                cameraDockHeight = min(
                  max((mediaAreaBounds.height * 0.2), DEFAULT_VALUES.cameraDockMinHeight),
                  (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight),
                );
              } else {
                cameraDockHeight = mediaAreaBounds.height;
              }
            } else {
              cameraDockHeight = min(
                max(cameraDockInput.height, DEFAULT_VALUES.cameraDockMinHeight),
                (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight),
              );
            }

            cameraDockBounds.top = DEFAULT_VALUES.navBarHeight
              + mediaAreaBounds.height - cameraDockHeight;
            cameraDockBounds.left = cameraDockLeft;
            cameraDockBounds.right = isRTL ? sidebarSize : null;
            cameraDockBounds.minWidth = mediaAreaBounds.width;
            cameraDockBounds.width = mediaAreaBounds.width;
            cameraDockBounds.maxWidth = mediaAreaBounds.width;
            cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
            cameraDockBounds.height = cameraDockHeight - camerasMargin;
            cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.8;
            break;
          }
          case CAMERADOCK_POSITION.CONTENT_LEFT: {
            if (cameraDockInput.width === 0) {
              if (presentationInput.isOpen) {
                cameraDockWidth = min(
                  max((mediaAreaBounds.width * 0.2), DEFAULT_VALUES.cameraDockMinWidth),
                  (mediaAreaBounds.width - DEFAULT_VALUES.cameraDockMinWidth),
                );
              } else {
                cameraDockWidth = mediaAreaBounds.width;
              }
            } else {
              cameraDockWidth = min(
                max(cameraDockInput.width, DEFAULT_VALUES.cameraDockMinWidth),
                (mediaAreaBounds.width - DEFAULT_VALUES.cameraDockMinWidth),
              );
            }

            cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
            cameraDockBounds.left = mediaAreaBounds.left + camerasMargin;
            cameraDockBounds.right = isRTL ? sidebarSize + (camerasMargin * 2) : null;
            cameraDockBounds.minWidth = DEFAULT_VALUES.cameraDockMinWidth;
            cameraDockBounds.width = cameraDockWidth - (camerasMargin * 2);
            cameraDockBounds.maxWidth = mediaAreaBounds.width * 0.8;
            cameraDockBounds.presenterMaxWidth = mediaAreaBounds.width
              - DEFAULT_VALUES.presentationToolbarMinWidth
              - camerasMargin;
            cameraDockBounds.minHeight = mediaAreaBounds.height;
            cameraDockBounds.height = mediaAreaBounds.height;
            cameraDockBounds.maxHeight = mediaAreaBounds.height;
            break;
          }
          case CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM: {
            if (cameraDockInput.height === 0) {
              cameraDockHeight = min(
                max((windowHeight() * 0.2), DEFAULT_VALUES.cameraDockMinHeight),
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
            cameraDockBounds.maxHeight = windowHeight() * 0.8;
            break;
          }
          default: {
            console.log('default');
          }
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

        if (cameraDockInput.isDragging) cameraDockBounds.zIndex = 99;
        else cameraDockBounds.zIndex = 1;
      }
    } else {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;
    }

    return cameraDockBounds;
  };

  const calculatesMediaBounds = (sidebarNavWidth, sidebarContentWidth, cameraDockBounds) => {
    const { isOpen } = presentationInput;
    const { height: actionBarHeight } = calculatesActionbarHeight();
    const mediaAreaHeight = windowHeight()
      - (DEFAULT_VALUES.navBarHeight + actionBarHeight);
    const mediaAreaWidth = windowWidth() - (sidebarNavWidth + sidebarContentWidth);
    const mediaBounds = {};
    const { element: fullscreenElement } = fullscreen;
    const { navBarHeight, camerasMargin } = DEFAULT_VALUES;

    if (!isOpen) {
      mediaBounds.width = 0;
      mediaBounds.height = 0;
      mediaBounds.top = 0;
      mediaBounds.left = !isRTL ? 0 : null;
      mediaBounds.right = isRTL ? 0 : null;
      mediaBounds.zIndex = 0;
      return mediaBounds;
    }

    if (fullscreenElement === 'Presentation' || fullscreenElement === 'Screenshare') {
      mediaBounds.width = windowWidth();
      mediaBounds.height = windowHeight();
      mediaBounds.top = 0;
      mediaBounds.left = !isRTL ? 0 : null;
      mediaBounds.right = isRTL ? 0 : null;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    const sidebarSize = sidebarNavWidth + sidebarContentWidth;

    if (cameraDockInput.numCameras > 0 && !cameraDockInput.isDragging) {
      switch (cameraDockInput.position) {
        case CAMERADOCK_POSITION.CONTENT_TOP: {
          mediaBounds.width = mediaAreaWidth;
          mediaBounds.height = mediaAreaHeight - cameraDockBounds.height - camerasMargin;
          mediaBounds.top = navBarHeight + cameraDockBounds.height + camerasMargin;
          mediaBounds.left = !isRTL ? sidebarSize : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
          break;
        }
        case CAMERADOCK_POSITION.CONTENT_RIGHT: {
          mediaBounds.width = mediaAreaWidth - cameraDockBounds.width - camerasMargin;
          mediaBounds.height = mediaAreaHeight;
          mediaBounds.top = navBarHeight;
          mediaBounds.left = !isRTL ? sidebarSize : null;
          mediaBounds.right = isRTL ? sidebarSize - (camerasMargin * 2) : null;
          break;
        }
        case CAMERADOCK_POSITION.CONTENT_BOTTOM: {
          mediaBounds.width = mediaAreaWidth;
          mediaBounds.height = mediaAreaHeight - cameraDockBounds.height - camerasMargin;
          mediaBounds.top = navBarHeight - camerasMargin;
          mediaBounds.left = !isRTL ? sidebarSize : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
          break;
        }
        case CAMERADOCK_POSITION.CONTENT_LEFT: {
          mediaBounds.width = mediaAreaWidth - cameraDockBounds.width - camerasMargin;
          mediaBounds.height = mediaAreaHeight;
          mediaBounds.top = navBarHeight;
          const sizeValue = sidebarNavWidth
            + sidebarContentWidth + mediaAreaWidth - mediaBounds.width;
          mediaBounds.left = !isRTL ? sizeValue : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
          break;
        }
        case CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM: {
          mediaBounds.width = mediaAreaWidth;
          mediaBounds.height = mediaAreaHeight;
          mediaBounds.top = navBarHeight;
          mediaBounds.left = !isRTL ? sidebarSize : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
          break;
        }
        default: {
          console.log('presentation - camera default');
        }
      }
      mediaBounds.zIndex = 1;
    } else {
      mediaBounds.width = mediaAreaWidth;
      mediaBounds.height = mediaAreaHeight;
      mediaBounds.top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight();
      mediaBounds.left = !isRTL ? sidebarSize : null;
      mediaBounds.right = isRTL ? sidebarSize : null;
    }

    return mediaBounds;
  }

  const calculatesLayout = () => {
    const { position: cameraPosition } = cameraDockInput;
    const { camerasMargin, captionsMargin } = DEFAULT_VALUES;

    const sidebarNavWidth = calculatesSidebarNavWidth();
    const sidebarNavHeight = calculatesSidebarNavHeight();
    const sidebarContentWidth = calculatesSidebarContentWidth();
    const sidebarNavBounds = calculatesSidebarNavBounds();
    const sidebarContentBounds = calculatesSidebarContentBounds(sidebarNavWidth.width);
    const mediaAreaBounds = calculatesMediaAreaBounds(sidebarNavWidth.width, sidebarContentWidth.width);
    const navbarBounds = calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = calculatesActionbarBounds(mediaAreaBounds);
    const cameraDockBounds = calculatesCameraDockBounds(
      sidebarNavWidth.width, sidebarContentWidth.width, mediaAreaBounds,
    );
    const dropZoneAreas = calculatesDropAreas(sidebarNavWidth.width, sidebarContentWidth.width, cameraDockBounds);
    const sidebarContentHeight = calculatesSidebarContentHeight(cameraDockBounds.height);
    const mediaBounds = calculatesMediaBounds(
      sidebarNavWidth.width, sidebarContentWidth.width, cameraDockBounds,
    );
    const { height: actionBarHeight } = calculatesActionbarHeight();

    let horizontalCameraDiff = 0;

    if (cameraPosition === CAMERADOCK_POSITION.CONTENT_LEFT) {
      horizontalCameraDiff = cameraDockBounds.width + (camerasMargin * 2);
    }

    if (cameraPosition === CAMERADOCK_POSITION.CONTENT_RIGHT) {
      horizontalCameraDiff = camerasMargin * 2;
    }

    layoutDispatch({
      type: ACTIONS.SET_NAVBAR_OUTPUT,
      value: {
        display: navbarInput.hasNavBar,
        width: navbarBounds.width,
        height: navbarBounds.height,
        top: navbarBounds.top,
        left: navbarBounds.left,
        tabOrder: DEFAULT_VALUES.navBarTabOrder,
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
        height: sidebarContentHeight,
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
        bottom: false,
        left: isRTL,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_MEDIA_AREA_SIZE,
      value: {
        width: windowWidth() - sidebarNavWidth.width - sidebarContentWidth.width,
        height: windowHeight() - DEFAULT_VALUES.navBarHeight - actionBarHeight,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_OUTPUT,
      value: {
        display: cameraDockInput.numCameras > 0,
        position: cameraDockInput.position,
        minWidth: cameraDockBounds.minWidth,
        width: cameraDockBounds.width,
        maxWidth: cameraDockBounds.maxWidth,
        presenterMaxWidth: cameraDockBounds.presenterMaxWidth,
        minHeight: cameraDockBounds.minHeight,
        height: cameraDockBounds.height,
        maxHeight: cameraDockBounds.maxHeight,
        top: cameraDockBounds.top,
        left: cameraDockBounds.left,
        right: cameraDockBounds.right,
        tabOrder: 4,
        isDraggable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        resizableEdge: {
          top: cameraDockInput.position === CAMERADOCK_POSITION.CONTENT_BOTTOM
            || cameraDockInput.position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM,
          right: (!isRTL && cameraDockInput.position === CAMERADOCK_POSITION.CONTENT_LEFT)
            || (isRTL && cameraDockInput.position === CAMERADOCK_POSITION.CONTENT_RIGHT),
          bottom: cameraDockInput.position === CAMERADOCK_POSITION.CONTENT_TOP,
          left: (!isRTL && cameraDockInput.position === CAMERADOCK_POSITION.CONTENT_RIGHT)
            || (isRTL && cameraDockInput.position === CAMERADOCK_POSITION.CONTENT_LEFT),
        },
        zIndex: cameraDockBounds.zIndex,
      },
    });

    layoutDispatch({
      type: ACTIONS.SET_DROP_AREAS,
      value: dropZoneAreas,
    });

    layoutDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: presentationInput.isOpen,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? (mediaBounds.right + horizontalCameraDiff) : null,
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
        right: isRTL ? (mediaBounds.right + horizontalCameraDiff) : null,
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
        right: isRTL ? (mediaBounds.right + horizontalCameraDiff) : null,
      },
    });
  };

  return null;
};

export default CustomLayout;
