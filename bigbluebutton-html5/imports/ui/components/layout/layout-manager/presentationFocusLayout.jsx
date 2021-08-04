import React, { Component } from 'react';
import { throttle, defaultsDeep } from 'lodash';
import NewLayoutContext from '../context/context';
import DEFAULT_VALUES from '../defaultValues';
import { INITIAL_INPUT_STATE } from '../context/initState';
import { DEVICE_TYPE, ACTIONS, PANELS } from '../enums';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;
const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

class PresentationFocusLayout extends Component {
  constructor(props) {
    super(props);

    this.throttledCalculatesLayout = throttle(() => this.calculatesLayout(),
      50, { trailing: true, leading: true });
  }

  componentDidMount() {
    this.init();
    const { newLayoutContextDispatch } = this.props;
    window.addEventListener('resize', () => {
      newLayoutContextDispatch({
        type: ACTIONS.SET_BROWSER_SIZE,
        value: {
          width: window.document.documentElement.clientWidth,
          height: window.document.documentElement.clientHeight,
        },
      });
    });
  }

  shouldComponentUpdate(nextProps) {
    const { newLayoutContextState } = this.props;
    return newLayoutContextState.input !== nextProps.newLayoutContextState.input
      || newLayoutContextState.deviceType !== nextProps.newLayoutContextState.deviceType
      || newLayoutContextState.isRTL !== nextProps.newLayoutContextState.isRTL
      || newLayoutContextState.fontSize !== nextProps.newLayoutContextState.fontSize
      || newLayoutContextState.fullscreen !== nextProps.newLayoutContextState.fullscreen;
  }

  componentDidUpdate(prevProps) {
    const { newLayoutContextState } = this.props;
    const { deviceType } = newLayoutContextState;
    if (prevProps.newLayoutContextState.deviceType !== deviceType) {
      this.init();
    } else {
      this.throttledCalculatesLayout();
    }
  }

  mainWidth() {
    return window.document.documentElement.clientWidth;
  }

  mainHeight() {
    return window.document.documentElement.clientHeight;
  }

  bannerAreaHeight() {
    const { newLayoutContextState } = this.props;
    const { input } = newLayoutContextState;
    const { bannerBar, notificationsBar } = input;

    const bannerHeight = bannerBar.hasBanner ? DEFAULT_VALUES.bannerHeight : 0;
    const notificationHeight = notificationsBar.hasNotification ? DEFAULT_VALUES.bannerHeight : 0;

    return bannerHeight + notificationHeight;
  }

  init() {
    const { newLayoutContextState, newLayoutContextDispatch } = this.props;
    const { deviceType, input } = newLayoutContextState;
    if (deviceType === DEVICE_TYPE.MOBILE) {
      newLayoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: defaultsDeep({
          sidebarNavigation: {
            isOpen: false,
            sidebarNavPanel: input.sidebarNavigation.sidebarNavPanel,
          },
          sidebarContent: {
            isOpen: false,
            sidebarContentPanel: input.sidebarContent.sidebarContentPanel,
          },
          SidebarContentHorizontalResizer: {
            isOpen: false,
          },
          presentation: {
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

      newLayoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: defaultsDeep({
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
    const { newLayoutContextState } = this.props;
    const { isRTL } = newLayoutContextState;

    return {
      width: mediaAreaBounds.width,
      height: DEFAULT_VALUES.navBarHeight,
      top: DEFAULT_VALUES.navBarTop + this.bannerAreaHeight(),
      left: !isRTL ? mediaAreaBounds.left : 0,
      zIndex: 1,
    };
  }

  calculatesActionbarHeight() {
    const { newLayoutContextState } = this.props;
    const { fontSize } = newLayoutContextState;

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
    const { newLayoutContextState } = this.props;
    const { input, isRTL } = newLayoutContextState;

    const actionBarHeight = this.calculatesActionbarHeight();

    return {
      display: input.actionBar.hasActionBar,
      width: mediaAreaBounds.width,
      height: actionBarHeight.height,
      innerHeight: actionBarHeight.innerHeight,
      padding: actionBarHeight.padding,
      top: this.mainHeight() - actionBarHeight.height,
      left: !isRTL ? mediaAreaBounds.left : 0,
      zIndex: 1,
    };
  }

  calculatesSidebarNavWidth() {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    const {
      sidebarNavMinWidth,
      sidebarNavMaxWidth,
    } = DEFAULT_VALUES;
    let minWidth = 0;
    let width = 0;
    let maxWidth = 0;
    if (input.sidebarNavigation.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        minWidth = this.mainWidth();
        width = this.mainWidth();
        maxWidth = this.mainWidth();
      } else {
        if (input.sidebarNavigation.width === 0) {
          width = min(max((this.mainWidth() * 0.2), sidebarNavMinWidth), sidebarNavMaxWidth);
        } else {
          width = min(max(input.sidebarNavigation.width, sidebarNavMinWidth), sidebarNavMaxWidth);
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
  }

  calculatesSidebarNavHeight() {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    const { navBarHeight } = DEFAULT_VALUES;
    let sidebarNavHeight = 0;
    if (input.sidebarNavigation.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        sidebarNavHeight = this.mainHeight() - navBarHeight - this.bannerAreaHeight();
      } else {
        sidebarNavHeight = this.mainHeight() - this.bannerAreaHeight();
      }
    }
    return sidebarNavHeight;
  }

  calculatesSidebarNavBounds() {
    const { newLayoutContextState } = this.props;
    const { deviceType, isRTL } = newLayoutContextState;
    const { sidebarNavTop, navBarHeight, sidebarNavLeft } = DEFAULT_VALUES;

    let top = sidebarNavTop + this.bannerAreaHeight();

    if (deviceType === DEVICE_TYPE.MOBILE) top = navBarHeight + this.bannerAreaHeight();

    return {
      top,
      left: !isRTL ? sidebarNavLeft : null,
      right: isRTL ? sidebarNavLeft : null,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 11 : 2,
    };
  }

  calculatesSidebarContentWidth() {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    const {
      sidebarContentMinWidth,
      sidebarContentMaxWidth,
    } = DEFAULT_VALUES;
    let minWidth = 0;
    let width = 0;
    let maxWidth = 0;
    if (input.sidebarContent.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        minWidth = this.mainWidth();
        width = this.mainWidth();
        maxWidth = this.mainWidth();
      } else {
        if (input.sidebarContent.width === 0) {
          width = min(
            max((this.mainWidth() * 0.2), sidebarContentMinWidth), sidebarContentMaxWidth,
          );
        } else {
          width = min(max(input.sidebarContent.width, sidebarContentMinWidth),
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
  }

  calculatesSidebarContentHeight() {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    const {
      navBarHeight,
      sidebarContentMinHeight,
    } = DEFAULT_VALUES;
    let height = 0;
    let minHeight = 0;
    let maxHeight = 0;
    if (input.sidebarContent.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        height = this.mainHeight() - navBarHeight - this.bannerAreaHeight();
        minHeight = height;
        maxHeight = height;
      } else if (input.cameraDock.numCameras > 0) {
        if (input.sidebarContent.height === 0) {
          height = (this.mainHeight() * 0.75) - this.bannerAreaHeight();
        } else {
          height = min(max(input.sidebarContent.height, sidebarContentMinHeight),
            this.mainHeight());
        }
        minHeight = this.mainHeight() * 0.25 - this.bannerAreaHeight();
        maxHeight = this.mainHeight() * 0.75 - this.bannerAreaHeight();
      } else {
        height = this.mainHeight() - this.bannerAreaHeight();
        minHeight = height;
        maxHeight = height;
      }
    }
    return {
      height,
      minHeight,
      maxHeight,
    };
  }

  calculatesSidebarContentBounds(sidebarNavWidth) {
    const { newLayoutContextState } = this.props;
    const { deviceType, isRTL } = newLayoutContextState;
    const { navBarHeight, sidebarNavTop } = DEFAULT_VALUES;

    let top = sidebarNavTop + this.bannerAreaHeight();

    if (deviceType === DEVICE_TYPE.MOBILE) top = navBarHeight + this.bannerAreaHeight();

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
  }

  calculatesMediaAreaBounds(sidebarNavWidth, sidebarContentWidth) {
    const { newLayoutContextState } = this.props;
    const { deviceType, isRTL } = newLayoutContextState;
    const { navBarHeight } = DEFAULT_VALUES;
    const { height: actionBarHeight } = this.calculatesActionbarHeight();
    let left = 0;
    let width = 0;
    if (deviceType === DEVICE_TYPE.MOBILE) {
      left = 0;
      width = this.mainWidth();
    } else {
      left = !isRTL ? sidebarNavWidth + sidebarContentWidth : 0;
      width = this.mainWidth() - sidebarNavWidth - sidebarContentWidth;
    }

    return {
      width,
      height: this.mainHeight() - (navBarHeight + actionBarHeight + this.bannerAreaHeight()),
      top: navBarHeight + this.bannerAreaHeight(),
      left,
    };
  }

  calculatesCameraDockBounds(
    mediaBounds,
    mediaAreaBounds,
    sidebarNavWidth,
    sidebarContentWidth,
    sidebarContentHeight,
  ) {
    const { newLayoutContextState } = this.props;
    const {
      deviceType, input, fullscreen, isRTL,
    } = newLayoutContextState;
    const cameraDockBounds = {};

    if (input.cameraDock.numCameras > 0) {
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
        if (input.cameraDock.height === 0) {
          cameraDockHeight = min(
            max((this.mainHeight() - sidebarContentHeight), DEFAULT_VALUES.cameraDockMinHeight),
            (this.mainHeight() - DEFAULT_VALUES.cameraDockMinHeight),
          );
        } else {
          cameraDockHeight = min(
            max(input.cameraDock.height, DEFAULT_VALUES.cameraDockMinHeight),
            (this.mainHeight() - DEFAULT_VALUES.cameraDockMinHeight),
          );
        }
        cameraDockBounds.top = this.mainHeight() - cameraDockHeight;
        cameraDockBounds.left = !isRTL ? sidebarNavWidth : 0;
        cameraDockBounds.right = isRTL ? sidebarNavWidth : 0;
        cameraDockBounds.minWidth = sidebarContentWidth;
        cameraDockBounds.width = sidebarContentWidth;
        cameraDockBounds.maxWidth = sidebarContentWidth;
        cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
        cameraDockBounds.height = cameraDockHeight;
        cameraDockBounds.maxHeight = this.mainHeight() - sidebarContentHeight;
        cameraDockBounds.zIndex = 1;
      }
    } else {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;
    }
    return cameraDockBounds;
  }

  calculatesMediaBounds(mediaAreaBounds, sidebarSize) {
    const { newLayoutContextState } = this.props;
    const {
      deviceType, input, fullscreen, isRTL,
    } = newLayoutContextState;
    const mediaBounds = {};
    const { element: fullscreenElement } = fullscreen;

    if (fullscreenElement === 'Presentation' || fullscreenElement === 'Screenshare') {
      mediaBounds.width = this.mainWidth();
      mediaBounds.height = this.mainHeight();
      mediaBounds.top = 0;
      mediaBounds.left = !isRTL ? 0 : null;
      mediaBounds.right = isRTL ? 0 : null;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    if (deviceType === DEVICE_TYPE.MOBILE && input.cameraDock.numCameras > 0) {
      mediaBounds.height = mediaAreaBounds.height * 0.7;
    } else {
      mediaBounds.height = mediaAreaBounds.height;
    }
    mediaBounds.width = mediaAreaBounds.width;
    mediaBounds.top = DEFAULT_VALUES.navBarHeight + this.bannerAreaHeight();
    mediaBounds.left = !isRTL ? mediaAreaBounds.left : null;
    mediaBounds.right = isRTL ? sidebarSize : null;
    mediaBounds.zIndex = 1;

    return mediaBounds;
  }

  calculatesLayout() {
    const { newLayoutContextState, newLayoutContextDispatch } = this.props;
    const { deviceType, input, isRTL } = newLayoutContextState;

    const sidebarNavWidth = this.calculatesSidebarNavWidth();
    const sidebarNavHeight = this.calculatesSidebarNavHeight();
    const sidebarContentWidth = this.calculatesSidebarContentWidth();
    const sidebarNavBounds = this.calculatesSidebarNavBounds(
      sidebarNavWidth.width, sidebarContentWidth.width,
    );
    const sidebarContentBounds = this.calculatesSidebarContentBounds(
      sidebarNavWidth.width, sidebarContentWidth.width,
    );
    const mediaAreaBounds = this.calculatesMediaAreaBounds(
      sidebarNavWidth.width, sidebarContentWidth.width,
    );
    const navbarBounds = this.calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = this.calculatesActionbarBounds(mediaAreaBounds);
    const sidebarSize = sidebarContentWidth.width + sidebarNavWidth.width;
    const mediaBounds = this.calculatesMediaBounds(mediaAreaBounds, sidebarSize);
    const sidebarContentHeight = this.calculatesSidebarContentHeight();
    const cameraDockBounds = this.calculatesCameraDockBounds(
      mediaBounds,
      mediaAreaBounds,
      sidebarNavWidth.width,
      sidebarContentWidth.width,
      sidebarContentHeight.height,
    );

    newLayoutContextDispatch({
      type: ACTIONS.SET_NAVBAR_OUTPUT,
      value: {
        display: input.navBar.hasNavBar,
        width: navbarBounds.width,
        height: navbarBounds.height,
        top: navbarBounds.top,
        left: navbarBounds.left,
        tabOrder: DEFAULT_VALUES.navBarTabOrder,
        zIndex: navbarBounds.zIndex,
      },
    });

    newLayoutContextDispatch({
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

    newLayoutContextDispatch({
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

    newLayoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_RESIZABLE_EDGE,
      value: {
        top: false,
        right: !isRTL,
        bottom: false,
        left: isRTL,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_OUTPUT,
      value: {
        display: input.sidebarContent.isOpen,
        minWidth: sidebarContentWidth.minWidth,
        width: sidebarContentWidth.width,
        maxWidth: sidebarContentWidth.maxWidth,
        minHeight: sidebarContentHeight.minHeight,
        height: sidebarContentHeight.height,
        maxHeight: sidebarContentHeight.maxHeight,
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

    newLayoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE,
      value: {
        top: false,
        right: !isRTL,
        bottom: input.cameraDock.numCameras > 0,
        left: isRTL,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_MEDIA_AREA_SIZE,
      value: {
        width: mediaAreaBounds.width,
        height: mediaAreaBounds.height,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_OUTPUT,
      value: {
        display: input.cameraDock.numCameras > 0,
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

    newLayoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: input.presentation.isOpen,
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

    newLayoutContextDispatch({
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

    newLayoutContextDispatch({
      type: ACTIONS.SET_EXTERNAL_VIDEO_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: mediaBounds.right,
      },
    });
  }

  render() {
    return (
      <></>
    );
  }
}

export default NewLayoutContext.withConsumer(PresentationFocusLayout);
