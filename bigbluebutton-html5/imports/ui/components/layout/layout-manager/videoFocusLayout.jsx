import React, { Component } from 'react';
import { throttle, defaultsDeep } from 'lodash';
import { LayoutContextFunc } from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { INITIAL_INPUT_STATE } from '/imports/ui/components/layout/initState';
import { DEVICE_TYPE, ACTIONS, PANELS } from '/imports/ui/components/layout/enums';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;
const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

class VideoFocusLayout extends Component {
  constructor(props) {
    super(props);

    this.throttledCalculatesLayout = throttle(() => this.calculatesLayout(),
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

  init() {
    const { layoutContextState, layoutContextDispatch } = this.props;
    const { input } = layoutContextState;
    const { deviceType } = layoutContextState;
    if (deviceType === DEVICE_TYPE.MOBILE) {
      layoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: defaultsDeep(
          {
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
              isOpen: input.presentation.isOpen,
              slidesLength: input.presentation.slidesLength,
              currentSlide: {
                ...input.presentation.currentSlide,
              },
            },
            cameraDock: {
              numCameras: input.cameraDock.numCameras,
            },
          },
          INITIAL_INPUT_STATE,
        ),
      });
    } else {
      const { sidebarContentPanel } = input.sidebarContent;

      layoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: defaultsDeep(
          {
            sidebarNavigation: {
              isOpen: input.sidebarNavigation.isOpen || sidebarContentPanel !== PANELS.NONE || false,
            },
            sidebarContent: {
              isOpen: sidebarContentPanel !== PANELS.NONE,
              sidebarContentPanel,
            },
            SidebarContentHorizontalResizer: {
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
          },
          INITIAL_INPUT_STATE,
        ),
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
      zIndex: 1,
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

    if (deviceType === DEVICE_TYPE.MOBILE) top = navBarHeight + this.bannerAreaHeight();

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
    }
    return {
      minWidth,
      width,
      maxWidth,
    };
  }

  calculatesSidebarContentHeight() {
    const { layoutContextState } = this.props;
    const { deviceType, input, output } = layoutContextState;
    const { sidebarContent: inputContent, presentation } = input;
    const { sidebarContent: outputContent } = output;
    let minHeight = 0;
    let height = 0;
    let maxHeight = 0;
    if (inputContent.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        height = windowHeight() - DEFAULT_VALUES.navBarHeight - this.bannerAreaHeight();
        minHeight = height;
        maxHeight = height;
      } else if (input.cameraDock.numCameras > 0 && presentation.isOpen) {
        if (inputContent.height > 0 && inputContent.height < windowHeight()) {
          height = inputContent.height - this.bannerAreaHeight();
        } else {
          const { size: slideSize } = input.presentation.currentSlide;
          let calculatedHeight = (windowHeight() - this.bannerAreaHeight()) * 0.3;

          if (slideSize.height > 0 && slideSize.width > 0) {
            calculatedHeight = (slideSize.height * outputContent.width) / slideSize.width;
          }
          height = windowHeight() - calculatedHeight - this.bannerAreaHeight();
        }
        maxHeight = windowHeight() * 0.75 - this.bannerAreaHeight();
        minHeight = windowHeight() * 0.25 - this.bannerAreaHeight();

        if (height > maxHeight) {
          height = maxHeight;
        }
      } else {
        height = windowHeight() - this.bannerAreaHeight();
        maxHeight = height;
        minHeight = height;
      }
    }
    return {
      minHeight,
      height,
      maxHeight,
    };
  }

  calculatesSidebarContentBounds(sidebarNavWidth) {
    const { layoutContextState } = this.props;
    const { deviceType, isRTL } = layoutContextState;
    const { sidebarNavTop, navBarHeight } = DEFAULT_VALUES;

    let top = sidebarNavTop + this.bannerAreaHeight();

    if (deviceType === DEVICE_TYPE.MOBILE) top = navBarHeight + this.bannerAreaHeight();

    let left = deviceType === DEVICE_TYPE.MOBILE ? 0 : sidebarNavWidth;
    let right = deviceType === DEVICE_TYPE.MOBILE ? 0 : sidebarNavWidth;
    left = !isRTL ? left : null;
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
      top: navBarHeight + this.bannerAreaHeight(),
      left,
    };
  }

  calculatesCameraDockBounds(mediaAreaBounds, sidebarSize) {
    const { layoutContextState } = this.props;
    const {
      deviceType, input, fullscreen, isRTL,
    } = layoutContextState;
    const { cameraDock, presentation } = input;
    const { isOpen } = presentation;
    const { numCameras } = cameraDock;

    const cameraDockBounds = {};

    if (numCameras > 0) {
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
        cameraDockBounds.height = mediaAreaBounds.height - this.bannerAreaHeight();
        cameraDockBounds.maxHeight = mediaAreaBounds.height;
        cameraDockBounds.top = DEFAULT_VALUES.navBarHeight + this.bannerAreaHeight();
        cameraDockBounds.left = !isRTL ? mediaAreaBounds.left : 0;
        cameraDockBounds.right = isRTL ? sidebarSize : null;
      } else {
        const mobileCameraHeight = mediaAreaBounds.height * 0.7 - this.bannerAreaHeight();
        const cameraHeight = mediaAreaBounds.height - this.bannerAreaHeight();

        if (deviceType === DEVICE_TYPE.MOBILE) {
          cameraDockBounds.minHeight = mobileCameraHeight;
          cameraDockBounds.height = mobileCameraHeight;
          cameraDockBounds.maxHeight = mobileCameraHeight;
        } else {
          cameraDockBounds.minHeight = cameraHeight;
          cameraDockBounds.height = cameraHeight;
          cameraDockBounds.maxHeight = cameraHeight;
        }

        cameraDockBounds.top = DEFAULT_VALUES.navBarHeight + this.bannerAreaHeight();
        cameraDockBounds.left = !isRTL ? mediaAreaBounds.left : null;
        cameraDockBounds.right = isRTL ? sidebarSize : null;
        cameraDockBounds.minWidth = mediaAreaBounds.width;
        cameraDockBounds.width = mediaAreaBounds.width;
        cameraDockBounds.maxWidth = mediaAreaBounds.width;
        cameraDockBounds.zIndex = 1;
      }
      return cameraDockBounds;
    }

    cameraDockBounds.top = 0;
    cameraDockBounds.left = 0;
    cameraDockBounds.minWidth = 0;
    cameraDockBounds.height = 0;
    cameraDockBounds.width = 0;
    cameraDockBounds.maxWidth = 0;
    cameraDockBounds.zIndex = 0;
    return cameraDockBounds;
  }

  calculatesMediaBounds(
    mediaAreaBounds,
    cameraDockBounds,
    sidebarNavWidth,
    sidebarContentWidth,
    sidebarContentHeight,
  ) {
    const { layoutContextState } = this.props;
    const {
      deviceType, input, fullscreen, isRTL,
    } = layoutContextState;
    const mediaBounds = {};
    const { element: fullscreenElement } = fullscreen;
    const sidebarSize = sidebarNavWidth + sidebarContentWidth;

    if (fullscreenElement === 'Presentation' || fullscreenElement === 'Screenshare' || fullscreenElement === 'ExternalVideo') {
      mediaBounds.width = windowWidth();
      mediaBounds.height = windowHeight();
      mediaBounds.top = 0;
      mediaBounds.left = 0;
      mediaBounds.right = 0;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    if (deviceType === DEVICE_TYPE.MOBILE) {
      mediaBounds.height = mediaAreaBounds.height - cameraDockBounds.height;
      mediaBounds.left = mediaAreaBounds.left;
      mediaBounds.top = mediaAreaBounds.top + cameraDockBounds.height;
      mediaBounds.width = mediaAreaBounds.width;
    } else if (input.cameraDock.numCameras > 0) {
      mediaBounds.height = windowHeight() - sidebarContentHeight - this.bannerAreaHeight();
      mediaBounds.left = !isRTL ? sidebarNavWidth : 0;
      mediaBounds.right = isRTL ? sidebarNavWidth : 0;
      mediaBounds.top = sidebarContentHeight + this.bannerAreaHeight();
      mediaBounds.width = sidebarContentWidth;
      mediaBounds.zIndex = 1;
    } else {
      mediaBounds.height = mediaAreaBounds.height;
      mediaBounds.width = mediaAreaBounds.width;
      mediaBounds.top = DEFAULT_VALUES.navBarHeight + this.bannerAreaHeight();
      mediaBounds.left = !isRTL ? mediaAreaBounds.left : null;
      mediaBounds.right = isRTL ? sidebarSize : null;
      mediaBounds.zIndex = 1;
    }

    return mediaBounds;
  }

  calculatesLayout() {
    const { layoutContextState, layoutContextDispatch } = this.props;
    const { deviceType, input, isRTL } = layoutContextState;
    const { captionsMargin } = DEFAULT_VALUES;

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
    const cameraDockBounds = this.calculatesCameraDockBounds(mediaAreaBounds, sidebarSize);
    const sidebarContentHeight = this.calculatesSidebarContentHeight();
    const mediaBounds = this.calculatesMediaBounds(
      mediaAreaBounds,
      cameraDockBounds,
      sidebarNavWidth.width,
      sidebarContentWidth.width,
      sidebarContentHeight.height,
    );
    const isBottomResizable = input.cameraDock.numCameras > 0;

    layoutContextDispatch({
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

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE,
      value: {
        top: false,
        right: !isRTL,
        bottom: isBottomResizable,
        left: isRTL,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_MEDIA_AREA_SIZE,
      value: {
        width: mediaAreaBounds.width,
        height: mediaAreaBounds.height,
      },
    });

    layoutContextDispatch({
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

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: input.presentation.isOpen,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right : null,
        tabOrder: DEFAULT_VALUES.presentationTabOrder,
        isResizable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        zIndex: mediaBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_RESIZABLE_EDGE,
      value: {
        top: true,
        right: false,
        bottom: false,
        left: false,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SCREEN_SHARE_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right : null,
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
        right: isRTL ? mediaBounds.right : null,
      },
    });
  }

  render() {
    return <></>;
  }
}

export default LayoutContextFunc.withConsumer(VideoFocusLayout);
