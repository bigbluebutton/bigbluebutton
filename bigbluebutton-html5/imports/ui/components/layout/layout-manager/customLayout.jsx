import { Component } from 'react';
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

class CustomLayout extends Component {
  constructor(props) {
    super(props);

    this.throttledCalculatesLayout = _.throttle(() => this.calculatesLayout(),
      50, { trailing: true, leading: true });
  }

  componentDidMount() {
    this.init();
    const { layoutContextDispatch } = this.props;
    window.addEventListener('resize', () => {
      layoutContextDispatch({
        type: ACTIONS.SET_BROWSER_SIZE,
        value: {
          width: window.document.documentElement.clientWidth,
          height: window.document.documentElement.clientHeight,
        },
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    const { layoutContextState } = this.props;
    return layoutContextState.input !== nextProps.layoutContextState.input
      || layoutContextState.deviceType !== nextProps.layoutContextState.deviceType
      || layoutContextState.isRTL !== nextProps.layoutContextState.isRTL
      || layoutContextState.fontSize !== nextProps.layoutContextState.fontSize
      || layoutContextState.fullscreen !== nextProps.layoutContextState.fullscreen;
  }

  componentDidUpdate(prevProps) {
    const { layoutContextState } = this.props;
    const { deviceType } = layoutContextState;

    if (prevProps.layoutContextState.deviceType !== deviceType) {
      this.init();
    } else {
      this.throttledCalculatesLayout();
    }
  }

  bannerAreaHeight() {
    const { layoutContextState } = this.props;
    const { input } = layoutContextState;
    const { bannerBar, notificationsBar } = input;

    const bannerHeight = bannerBar.hasBanner ? DEFAULT_VALUES.bannerHeight : 0;
    const notificationHeight = notificationsBar.hasNotification ? DEFAULT_VALUES.bannerHeight : 0;

    return bannerHeight + notificationHeight;
  }

  calculatesDropAreas(sidebarNavWidth, sidebarContentWidth, cameraDockBounds) {
    const { layoutContextState } = this.props;
    const { isRTL } = layoutContextState;
    const { height: actionBarHeight } = this.calculatesActionbarHeight();
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
  }

  init() {
    const { layoutContextState, layoutContextDispatch } = this.props;
    const { deviceType, input } = layoutContextState;

    if (deviceType === DEVICE_TYPE.MOBILE) {
      layoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: _.defaultsDeep({
          sidebarNavigation: {
            isOpen: false,
            sidebarNavPanel: input.sidebarNavigation.sidebarNavPanel,
          },
          sidebarContent: {
            isOpen: false,
            sidebarContentPanel: input.sidebarContent.sidebarContentPanel,
          },
          sidebarContentHorizontalResizer: {
            isOpen: false,
          },
          presentation: {
            isOpen: input.presentation.isOpen,
            slidesLength: input.presentation.slidesLength,
            currentSlide: {
              ...input.presentation.currentSlide,
            },
          },
          cameraDock: {
            numCameras: input.cameraDock.numCameras,
          },
        }, INITIAL_INPUT_STATE),
      });
    } else {
      const { sidebarContentPanel } = input.sidebarContent;

      layoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: _.defaultsDeep({
          sidebarNavigation: {
            isOpen: input.sidebarNavigation.isOpen || sidebarContentPanel !== PANELS.NONE || false,
          },
          sidebarContent: {
            isOpen: sidebarContentPanel !== PANELS.NONE,
            sidebarContentPanel,
          },
          sidebarContentHorizontalResizer: {
            isOpen: false,
          },
          presentation: {
            isOpen: input.presentation.isOpen,
            slidesLength: input.presentation.slidesLength,
            currentSlide: {
              ...input.presentation.currentSlide,
            },
          },
          cameraDock: {
            numCameras: input.cameraDock.numCameras,
          },
        }, INITIAL_INPUT_STATE),
      });
    }
    this.throttledCalculatesLayout();
  }

  reset() {
    this.init();
  }

  calculatesNavbarBounds(mediaAreaBounds) {
    const { layoutContextState } = this.props;
    const { isRTL } = layoutContextState;

    return {
      width: mediaAreaBounds.width,
      height: DEFAULT_VALUES.navBarHeight,
      top: DEFAULT_VALUES.navBarTop + this.bannerAreaHeight(),
      left: !isRTL ? mediaAreaBounds.left : 0,
    };
  }

  calculatesActionbarHeight() {
    const { layoutContextState } = this.props;
    const { fontSize } = layoutContextState;

    const BASE_FONT_SIZE = 14; // 90% font size
    const BASE_HEIGHT = DEFAULT_VALUES.actionBarHeight;
    const PADDING = DEFAULT_VALUES.actionBarPadding;

    const actionBarHeight = ((BASE_HEIGHT / BASE_FONT_SIZE) * fontSize);

    return {
      height: actionBarHeight + (PADDING * 2),
      innerHeight: actionBarHeight,
      padding: PADDING,
    };
  }

  calculatesActionbarBounds(mediaAreaBounds) {
    const { layoutContextState } = this.props;
    const { input, isRTL } = layoutContextState;

    const actionBarHeight = this.calculatesActionbarHeight();

    return {
      display: input.actionBar.hasActionBar,
      width: mediaAreaBounds.width,
      height: actionBarHeight.height,
      innerHeight: actionBarHeight.innerHeight,
      padding: actionBarHeight.padding,
      top: windowHeight() - actionBarHeight.height,
      left: !isRTL ? mediaAreaBounds.left : 0,
      zIndex: 1,
    };
  }

  calculatesSidebarNavWidth() {
    const { layoutContextState } = this.props;
    const { deviceType, input } = layoutContextState;
    const {
      sidebarNavMinWidth,
      sidebarNavMaxWidth,
    } = DEFAULT_VALUES;
    let minWidth = 0;
    let width = 0;
    let maxWidth = 0;
    if (input.sidebarNavigation.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        minWidth = windowWidth();
        width = windowWidth();
        maxWidth = windowWidth();
      } else {
        if (input.sidebarNavigation.width === 0) {
          width = min(max((windowWidth() * 0.2), sidebarNavMinWidth), sidebarNavMaxWidth);
        } else {
          width = min(max(input.sidebarNavigation.width, sidebarNavMinWidth), sidebarNavMaxWidth);
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
  }

  calculatesSidebarNavHeight() {
    const { layoutContextState } = this.props;
    const { deviceType, input } = layoutContextState;
    let sidebarNavHeight = 0;
    if (input.sidebarNavigation.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        sidebarNavHeight = windowHeight() - DEFAULT_VALUES.navBarHeight;
      } else {
        sidebarNavHeight = windowHeight();
      }
      sidebarNavHeight -= this.bannerAreaHeight();
    }
    return sidebarNavHeight;
  }

  calculatesSidebarNavBounds() {
    const { layoutContextState } = this.props;
    const { deviceType, isRTL } = layoutContextState;
    const { sidebarNavTop, navBarHeight, sidebarNavLeft } = DEFAULT_VALUES;

    let top = sidebarNavTop + this.bannerAreaHeight();

    if (deviceType === DEVICE_TYPE.MOBILE) {
      top = navBarHeight + this.bannerAreaHeight();
    }

    return {
      top,
      left: !isRTL ? sidebarNavLeft : null,
      right: isRTL ? sidebarNavLeft : null,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 10 : 2,
    };
  }

  calculatesSidebarContentWidth() {
    const { layoutContextState } = this.props;
    const { deviceType, input } = layoutContextState;
    const {
      sidebarContentMinWidth,
      sidebarContentMaxWidth,
    } = DEFAULT_VALUES;
    let minWidth = 0;
    let width = 0;
    let maxWidth = 0;
    if (input.sidebarContent.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        minWidth = windowWidth();
        width = windowWidth();
        maxWidth = windowWidth();
      } else {
        if (input.sidebarContent.width === 0) {
          width = min(
            max((windowWidth() * 0.2), sidebarContentMinWidth), sidebarContentMaxWidth,
          );
        } else {
          width = min(max(input.sidebarContent.width, sidebarContentMinWidth),
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
  }

  calculatesSidebarContentHeight(cameraDockHeight) {
    const { layoutContextState } = this.props;
    const { deviceType, input } = layoutContextState;
    const { presentation } = input;
    const { isOpen } = presentation;
    let sidebarContentHeight = 0;
    if (input.sidebarContent.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        sidebarContentHeight = windowHeight() - DEFAULT_VALUES.navBarHeight;
      } else if (input.cameraDock.numCameras > 0
        && input.cameraDock.position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM
        && isOpen) {
        sidebarContentHeight = windowHeight() - cameraDockHeight;
      } else {
        sidebarContentHeight = windowHeight();
      }
      sidebarContentHeight -= this.bannerAreaHeight();
    }
    return sidebarContentHeight;
  }

  calculatesSidebarContentBounds(sidebarNavWidth) {
    const { layoutContextState } = this.props;
    const { deviceType, isRTL } = layoutContextState;

    let top = DEFAULT_VALUES.sidebarNavTop + this.bannerAreaHeight();

    if (deviceType === DEVICE_TYPE.MOBILE) {
      top = DEFAULT_VALUES.navBarHeight + this.bannerAreaHeight();
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
  }

  calculatesMediaAreaBounds(sidebarNavWidth, sidebarContentWidth) {
    const { layoutContextState } = this.props;
    const { deviceType, isRTL } = layoutContextState;
    const { navBarHeight } = DEFAULT_VALUES;
    const { height: actionBarHeight } = this.calculatesActionbarHeight();
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
      height: windowHeight() - (navBarHeight + actionBarHeight + this.bannerAreaHeight()),
      top: DEFAULT_VALUES.navBarHeight + this.bannerAreaHeight(),
      left,
    };
  }

  calculatesCameraDockBounds(sidebarNavWidth, sidebarContentWidth, mediaAreaBounds) {
    const { layoutContextState } = this.props;
    const {
      input, fullscreen, isRTL, deviceType,
    } = layoutContextState;
    const { presentation } = input;
    const { isOpen } = presentation;
    const { camerasMargin } = DEFAULT_VALUES;
    const sidebarSize = sidebarNavWidth + sidebarContentWidth;
    const bannerAreaHeight = this.bannerAreaHeight();

    const cameraDockBounds = {};

    if (input.cameraDock.numCameras > 0) {
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

      if (!isOpen) {
        cameraDockBounds.width = mediaAreaBounds.width;
        cameraDockBounds.maxWidth = mediaAreaBounds.width;
        cameraDockBounds.height = mediaAreaBounds.height - bannerAreaHeight;
        cameraDockBounds.maxHeight = mediaAreaBounds.height;
        cameraDockBounds.top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight;
        cameraDockBounds.left = !isRTL ? mediaAreaBounds.left : 0;
        cameraDockBounds.right = isRTL ? sidebarSize : null;
      } else {
        let cameraDockLeft = 0;
        let cameraDockHeight = 0;
        let cameraDockWidth = 0;
        switch (input.cameraDock.position) {
          case CAMERADOCK_POSITION.CONTENT_TOP: {
            cameraDockLeft = mediaAreaBounds.left;

            if (input.cameraDock.height === 0 || deviceType === DEVICE_TYPE.MOBILE) {
              if (input.presentation.isOpen) {
                cameraDockHeight = min(
                  max((mediaAreaBounds.height * 0.2), DEFAULT_VALUES.cameraDockMinHeight),
                  (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight),
                );
              } else {
                cameraDockHeight = mediaAreaBounds.height;
              }
            } else {
              cameraDockHeight = min(
                max(input.cameraDock.height, DEFAULT_VALUES.cameraDockMinHeight),
                (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight),
              );
            }

            cameraDockBounds.top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight;
            cameraDockBounds.left = cameraDockLeft;
            cameraDockBounds.right = isRTL ? sidebarSize : null;
            cameraDockBounds.minWidth = mediaAreaBounds.width;
            cameraDockBounds.width = mediaAreaBounds.width;
            cameraDockBounds.maxWidth = mediaAreaBounds.width;
            cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
            cameraDockBounds.height = cameraDockHeight;
            cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.8;
            break;
          }
          case CAMERADOCK_POSITION.CONTENT_RIGHT: {
            if (input.cameraDock.width === 0) {
              if (input.presentation.isOpen) {
                cameraDockWidth = min(
                  max((mediaAreaBounds.width * 0.2), DEFAULT_VALUES.cameraDockMinWidth),
                  (mediaAreaBounds.width - DEFAULT_VALUES.cameraDockMinWidth),
                );
              } else {
                cameraDockWidth = mediaAreaBounds.width;
              }
            } else {
              cameraDockWidth = min(
                max(input.cameraDock.width, DEFAULT_VALUES.cameraDockMinWidth),
                (mediaAreaBounds.width - DEFAULT_VALUES.cameraDockMinWidth),
              );
            }

            cameraDockBounds.top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight;
            const sizeValue = input.presentation.isOpen
              ? (mediaAreaBounds.left + mediaAreaBounds.width) - cameraDockWidth
              : mediaAreaBounds.left;
            cameraDockBounds.left = !isRTL ? sizeValue - camerasMargin : 0;
            cameraDockBounds.right = isRTL ? sizeValue + sidebarSize - camerasMargin : null;
            cameraDockBounds.minWidth = DEFAULT_VALUES.cameraDockMinWidth;
            cameraDockBounds.width = cameraDockWidth;
            cameraDockBounds.maxWidth = mediaAreaBounds.width * 0.8;
            cameraDockBounds.presenterMaxWidth = mediaAreaBounds.width
              - DEFAULT_VALUES.presentationToolbarMinWidth
              - camerasMargin;
            cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
            cameraDockBounds.height = mediaAreaBounds.height;
            cameraDockBounds.maxHeight = mediaAreaBounds.height;
            // button size in vertical position
            cameraDockBounds.height -= 20;
            break;
          }
          case CAMERADOCK_POSITION.CONTENT_BOTTOM: {
            cameraDockLeft = mediaAreaBounds.left;

            if (input.cameraDock.height === 0) {
              if (input.presentation.isOpen) {
                cameraDockHeight = min(
                  max((mediaAreaBounds.height * 0.2), DEFAULT_VALUES.cameraDockMinHeight),
                  (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight),
                );
              } else {
                cameraDockHeight = mediaAreaBounds.height;
              }
            } else {
              cameraDockHeight = min(
                max(input.cameraDock.height, DEFAULT_VALUES.cameraDockMinHeight),
                (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight),
              );
            }

            cameraDockBounds.top = DEFAULT_VALUES.navBarHeight
              + mediaAreaBounds.height - cameraDockHeight + bannerAreaHeight;
            cameraDockBounds.left = cameraDockLeft;
            cameraDockBounds.right = isRTL ? sidebarSize : null;
            cameraDockBounds.minWidth = mediaAreaBounds.width;
            cameraDockBounds.width = mediaAreaBounds.width;
            cameraDockBounds.maxWidth = mediaAreaBounds.width;
            cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
            cameraDockBounds.height = cameraDockHeight;
            cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.8;
            break;
          }
          case CAMERADOCK_POSITION.CONTENT_LEFT: {
            if (input.cameraDock.width === 0) {
              if (input.presentation.isOpen) {
                cameraDockWidth = min(
                  max((mediaAreaBounds.width * 0.2), DEFAULT_VALUES.cameraDockMinWidth),
                  (mediaAreaBounds.width - DEFAULT_VALUES.cameraDockMinWidth),
                );
              } else {
                cameraDockWidth = mediaAreaBounds.width;
              }
            } else {
              cameraDockWidth = min(
                max(input.cameraDock.width, DEFAULT_VALUES.cameraDockMinWidth),
                (mediaAreaBounds.width - DEFAULT_VALUES.cameraDockMinWidth),
              );
            }

            cameraDockBounds.top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight;
            cameraDockBounds.left = mediaAreaBounds.left + camerasMargin;
            cameraDockBounds.right = isRTL ? sidebarSize + (camerasMargin * 2) : null;
            cameraDockBounds.minWidth = DEFAULT_VALUES.cameraDockMinWidth;
            cameraDockBounds.width = cameraDockWidth;
            cameraDockBounds.maxWidth = mediaAreaBounds.width * 0.8;
            cameraDockBounds.presenterMaxWidth = mediaAreaBounds.width
              - DEFAULT_VALUES.presentationToolbarMinWidth
              - camerasMargin;
            cameraDockBounds.minHeight = mediaAreaBounds.height;
            cameraDockBounds.height = mediaAreaBounds.height;
            cameraDockBounds.maxHeight = mediaAreaBounds.height;
            // button size in vertical position
            cameraDockBounds.height -= 20;
            break;
          }
          case CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM: {
            if (input.cameraDock.height === 0) {
              cameraDockHeight = min(
                max((windowHeight() * 0.2), DEFAULT_VALUES.cameraDockMinHeight),
                (windowHeight() - DEFAULT_VALUES.cameraDockMinHeight),
              );
            } else {
              cameraDockHeight = min(
                max(input.cameraDock.height, DEFAULT_VALUES.cameraDockMinHeight),
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
        if (input.cameraDock.isDragging) cameraDockBounds.zIndex = 99;
        else cameraDockBounds.zIndex = 1;
      }
    } else {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;
    }

    return cameraDockBounds;
  }

  calculatesMediaBounds(sidebarNavWidth, sidebarContentWidth, cameraDockBounds) {
    const { layoutContextState } = this.props;
    const { input, fullscreen, isRTL } = layoutContextState;
    const { presentation } = input;
    const { isOpen } = presentation;
    const { height: actionBarHeight } = this.calculatesActionbarHeight();
    const bannerAreaHeight = this.bannerAreaHeight();
    const mediaAreaHeight = windowHeight()
      - (DEFAULT_VALUES.navBarHeight + actionBarHeight + bannerAreaHeight);
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

    if (fullscreenElement === 'Presentation' || fullscreenElement === 'Screenshare' || fullscreenElement === 'ExternalVideo') {
      mediaBounds.width = windowWidth();
      mediaBounds.height = windowHeight();
      mediaBounds.top = 0;
      mediaBounds.left = !isRTL ? 0 : null;
      mediaBounds.right = isRTL ? 0 : null;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    const sidebarSize = sidebarNavWidth + sidebarContentWidth;

    if (input.cameraDock.numCameras > 0 && !input.cameraDock.isDragging) {
      switch (input.cameraDock.position) {
        case CAMERADOCK_POSITION.CONTENT_TOP: {
          mediaBounds.width = mediaAreaWidth;
          mediaBounds.height = mediaAreaHeight - cameraDockBounds.height - camerasMargin;
          mediaBounds.top = navBarHeight + cameraDockBounds.height + camerasMargin + bannerAreaHeight;
          mediaBounds.left = !isRTL ? sidebarSize : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
          break;
        }
        case CAMERADOCK_POSITION.CONTENT_RIGHT: {
          mediaBounds.width = mediaAreaWidth - cameraDockBounds.width - (camerasMargin * 2);
          mediaBounds.height = mediaAreaHeight;
          mediaBounds.top = navBarHeight + bannerAreaHeight;
          mediaBounds.left = !isRTL ? sidebarSize : null;
          mediaBounds.right = isRTL ? sidebarSize - (camerasMargin * 2) : null;
          break;
        }
        case CAMERADOCK_POSITION.CONTENT_BOTTOM: {
          mediaBounds.width = mediaAreaWidth;
          mediaBounds.height = mediaAreaHeight - cameraDockBounds.height - camerasMargin;
          mediaBounds.top = navBarHeight - camerasMargin + bannerAreaHeight;
          mediaBounds.left = !isRTL ? sidebarSize : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
          break;
        }
        case CAMERADOCK_POSITION.CONTENT_LEFT: {
          mediaBounds.width = mediaAreaWidth - cameraDockBounds.width - (camerasMargin * 2);
          mediaBounds.height = mediaAreaHeight;
          mediaBounds.top = navBarHeight + bannerAreaHeight;
          const sizeValue = sidebarNavWidth
            + sidebarContentWidth + mediaAreaWidth - mediaBounds.width;
          mediaBounds.left = !isRTL ? sizeValue : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
          break;
        }
        case CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM: {
          mediaBounds.width = mediaAreaWidth;
          mediaBounds.height = mediaAreaHeight;
          mediaBounds.top = navBarHeight + bannerAreaHeight;
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
      mediaBounds.top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight;
      mediaBounds.left = !isRTL ? sidebarSize : null;
      mediaBounds.right = isRTL ? sidebarSize : null;
    }

    return mediaBounds;
  }

  calculatesLayout() {
    const { layoutContextState, layoutContextDispatch } = this.props;
    const { deviceType, input, isRTL } = layoutContextState;
    const { cameraDock } = input;
    const { position: cameraPosition } = cameraDock;
    const { camerasMargin, captionsMargin } = DEFAULT_VALUES;

    const sidebarNavWidth = this.calculatesSidebarNavWidth();
    const sidebarNavHeight = this.calculatesSidebarNavHeight();
    const sidebarContentWidth = this.calculatesSidebarContentWidth();
    const sidebarNavBounds = this
      .calculatesSidebarNavBounds(sidebarNavWidth.width, sidebarContentWidth.width);
    const sidebarContentBounds = this
      .calculatesSidebarContentBounds(sidebarNavWidth.width, sidebarContentWidth.width);
    const mediaAreaBounds = this
      .calculatesMediaAreaBounds(sidebarNavWidth.width, sidebarContentWidth.width);
    const navbarBounds = this.calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = this.calculatesActionbarBounds(mediaAreaBounds);
    const cameraDockBounds = this.calculatesCameraDockBounds(
      sidebarNavWidth.width, sidebarContentWidth.width, mediaAreaBounds,
    );
    const dropZoneAreas = this
      .calculatesDropAreas(sidebarNavWidth.width, sidebarContentWidth.width, cameraDockBounds);
    const sidebarContentHeight = this.calculatesSidebarContentHeight(cameraDockBounds.height);
    const mediaBounds = this.calculatesMediaBounds(
      sidebarNavWidth.width, sidebarContentWidth.width, cameraDockBounds,
    );
    const { height: actionBarHeight } = this.calculatesActionbarHeight();

    let horizontalCameraDiff = 0;

    if (cameraPosition === CAMERADOCK_POSITION.CONTENT_LEFT) {
      horizontalCameraDiff = cameraDockBounds.width + (camerasMargin * 2);
    }

    if (cameraPosition === CAMERADOCK_POSITION.CONTENT_RIGHT) {
      horizontalCameraDiff = camerasMargin * 2;
    }

    layoutContextDispatch({
      type: ACTIONS.SET_NAVBAR_OUTPUT,
      value: {
        display: input.navBar.hasNavBar,
        width: navbarBounds.width,
        height: navbarBounds.height,
        top: navbarBounds.top,
        left: navbarBounds.left,
        tabOrder: DEFAULT_VALUES.navBarTabOrder,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_ACTIONBAR_OUTPUT,
      value: {
        display: input.actionBar.hasActionBar,
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

    layoutContextDispatch({
      type: ACTIONS.SET_CAPTIONS_OUTPUT,
      value: {
        left: !isRTL ? (mediaBounds.left + captionsMargin) : null,
        right: isRTL ? (mediaBounds.right + captionsMargin) : null,
        maxWidth: mediaBounds.width - (captionsMargin * 2),
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_OUTPUT,
      value: {
        display: input.sidebarNavigation.isOpen,
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

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_RESIZABLE_EDGE,
      value: {
        top: false,
        right: !isRTL,
        bottom: false,
        left: isRTL,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_OUTPUT,
      value: {
        display: input.sidebarContent.isOpen,
        minWidth: sidebarContentWidth.minWidth,
        width: sidebarContentWidth.width,
        maxWidth: sidebarContentWidth.maxWidth,
        height: sidebarContentHeight,
        top: sidebarContentBounds.top,
        left: sidebarContentBounds.left,
        right: sidebarContentBounds.right,
        currentPanelType: input.currentPanelType,
        tabOrder: DEFAULT_VALUES.sidebarContentTabOrder,
        isResizable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        zIndex: sidebarContentBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE,
      value: {
        top: false,
        right: !isRTL,
        bottom: false,
        left: isRTL,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_MEDIA_AREA_SIZE,
      value: {
        width: windowWidth() - sidebarNavWidth.width - sidebarContentWidth.width,
        height: windowHeight() - DEFAULT_VALUES.navBarHeight - actionBarHeight,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_OUTPUT,
      value: {
        display: input.cameraDock.numCameras > 0,
        position: input.cameraDock.position,
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
          top: input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_BOTTOM
            || input.cameraDock.position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM,
          right: (!isRTL && input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_LEFT)
            || (isRTL && input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_RIGHT),
          bottom: input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_TOP,
          left: (!isRTL && input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_RIGHT)
            || (isRTL && input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_LEFT),
        },
        zIndex: cameraDockBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_DROP_AREAS,
      value: dropZoneAreas,
    });

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: input.presentation.isOpen,
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

    layoutContextDispatch({
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

    layoutContextDispatch({
      type: ACTIONS.SET_EXTERNAL_VIDEO_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? (mediaBounds.right + horizontalCameraDiff) : null,
      },
    });
  }

  render() {
    return null;
  }
}

export default LayoutContextFunc.withConsumer(CustomLayout);
