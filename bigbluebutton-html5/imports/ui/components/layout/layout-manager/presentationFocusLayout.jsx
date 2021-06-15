import React, { Component, Fragment } from 'react';
import { throttle, defaultsDeep } from 'lodash';
import NewLayoutContext from '../context/context';
import DEFAULT_VALUES from '../defaultValues';
import { INITIAL_INPUT_STATE } from '../context/initState';
import { DEVICE_TYPE, ACTIONS } from '../enums';

// const windowWidth = () => window.document.documentElement.clientWidth;
// const windowHeight = () => window.document.documentElement.clientHeight;
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
      || newLayoutContextState.layoutLoaded !== nextProps.newLayoutContextState.layoutLoaded;
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
    const { newLayoutContextState } = this.props;
    const { layoutLoaded } = newLayoutContextState;
    const wWidth = window.document.documentElement.clientWidth;

    if (layoutLoaded === 'both') return wWidth / 2;
    return wWidth;
  }

  mainHeight() {
    const { newLayoutContextState } = this.props;
    const { layoutLoaded } = newLayoutContextState;
    const wHeight = window.document.documentElement.clientHeight;

    if (layoutLoaded === 'both') return wHeight / 2;
    return wHeight;
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
      newLayoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: defaultsDeep({
          sidebarNavigation: {
            isOpen: true,
          },
          sidebarContent: {
            isOpen: deviceType === DEVICE_TYPE.TABLET_LANDSCAPE
              || deviceType === DEVICE_TYPE.DESKTOP,
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
    const { layoutLoaded } = newLayoutContextState;

    let top = 0;
    if (layoutLoaded === 'both') top = this.mainHeight();
    else top = DEFAULT_VALUES.navBarTop;

    return {
      width: this.mainWidth() - mediaAreaBounds.left,
      height: DEFAULT_VALUES.navBarHeight,
      top,
      left: mediaAreaBounds.left,
      zIndex: 1,
    };
  }

  calculatesActionbarBounds(mediaAreaBounds) {
    const { newLayoutContextState } = this.props;
    const { input } = newLayoutContextState;
    return {
      display: input.actionBar.hasActionBar,
      width: this.mainWidth() - mediaAreaBounds.left,
      height: DEFAULT_VALUES.actionBarHeight,
      top: this.mainHeight() - DEFAULT_VALUES.actionBarHeight,
      left: mediaAreaBounds.left,
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
    let sidebarNavHeight = 0;
    if (input.sidebarNavigation.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        sidebarNavHeight = this.mainHeight() - DEFAULT_VALUES.navBarHeight;
      } else {
        sidebarNavHeight = this.mainHeight();
      }
    }
    return sidebarNavHeight;
  }

  calculatesSidebarNavBounds() {
    const { newLayoutContextState } = this.props;
    const { deviceType, layoutLoaded } = newLayoutContextState;

    let top = 0;
    if (layoutLoaded === 'both') top = this.mainHeight();
    else top = DEFAULT_VALUES.sidebarNavTop;

    if (deviceType === DEVICE_TYPE.MOBILE) top = DEFAULT_VALUES.navBarHeight;

    return {
      top,
      left: DEFAULT_VALUES.sidebarNavLeft,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 11 : 1,
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

  calculatesSidebarContentHeight(cameraDockHeight) {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    let sidebarContentHeight = 0;
    if (input.sidebarContent.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        sidebarContentHeight = this.mainHeight() - DEFAULT_VALUES.navBarHeight;
      } else if (input.cameraDock.numCameras > 0) {
        sidebarContentHeight = this.mainHeight() - cameraDockHeight;
      } else {
        sidebarContentHeight = this.mainHeight();
      }
    }
    return sidebarContentHeight;
  }

  calculatesSidebarContentBounds(sidebarNavWidth) {
    const { newLayoutContextState } = this.props;
    const { deviceType, layoutLoaded } = newLayoutContextState;

    let top = 0;
    if (layoutLoaded === 'both') top = this.mainHeight();
    else top = DEFAULT_VALUES.sidebarNavTop;

    if (deviceType === DEVICE_TYPE.MOBILE) top = DEFAULT_VALUES.navBarHeight;

    return {
      top,
      left: deviceType === DEVICE_TYPE.MOBILE
        || deviceType === DEVICE_TYPE.TABLET_PORTRAIT ? 0 : sidebarNavWidth,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 11 : 2,
    };
  }

  calculatesMediaAreaBounds(sidebarNavWidth, sidebarContentWidth) {
    const { newLayoutContextState } = this.props;
    const { deviceType, input, layoutLoaded } = newLayoutContextState;
    const { sidebarContent } = input;
    let left = 0;
    let width = 0;
    let top = 0;
    if (deviceType === DEVICE_TYPE.MOBILE) {
      left = 0;
      width = this.mainWidth();
    } else if (deviceType === DEVICE_TYPE.TABLET_PORTRAIT) {
      if (sidebarContent.isOpen) {
        left = sidebarContentWidth;
        width = this.mainWidth() - sidebarContentWidth;
      } else {
        left = sidebarNavWidth;
        width = this.mainWidth() - sidebarNavWidth;
      }
    } else {
      left = sidebarNavWidth + sidebarContentWidth;
      width = this.mainWidth() - sidebarNavWidth - sidebarContentWidth;
    }

    if (layoutLoaded === 'both') top = this.mainHeight() / 2;
    else top = DEFAULT_VALUES.navBarHeight;

    return {
      width,
      height: this.mainHeight() - (DEFAULT_VALUES.navBarHeight + DEFAULT_VALUES.actionBarHeight),
      top,
      left,
    };
  }

  calculatesCameraDockBounds(
    mediaBounds,
    mediaAreaBounds,
    sidebarNavWidth,
    sidebarContentWidth,
  ) {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    const cameraDockBounds = {};

    if (input.cameraDock.isFullscreen) {
      cameraDockBounds.width = this.mainWidth();
      cameraDockBounds.minWidth = this.mainWidth();
      cameraDockBounds.maxWidth = this.mainWidth();
      cameraDockBounds.height = this.mainHeight();
      cameraDockBounds.minHeight = this.mainHeight();
      cameraDockBounds.maxHeight = this.mainHeight();
      cameraDockBounds.top = 0;
      cameraDockBounds.left = 0;
      cameraDockBounds.zIndex = 99;
      return cameraDockBounds;
    }

    if (input.cameraDock.numCameras > 0) {
      let cameraDockHeight = 0;
      if (deviceType === DEVICE_TYPE.MOBILE) {
        cameraDockBounds.top = mediaAreaBounds.top + mediaBounds.height;
        cameraDockBounds.left = mediaAreaBounds.left;
        cameraDockBounds.minWidth = mediaAreaBounds.width;
        cameraDockBounds.width = mediaAreaBounds.width;
        cameraDockBounds.maxWidth = mediaAreaBounds.width;
        cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
        cameraDockBounds.height = mediaAreaBounds.height - mediaBounds.height;
        cameraDockBounds.maxHeight = mediaAreaBounds.height - mediaBounds.height;
      } else {
        if (input.cameraDock.height === 0) {
          cameraDockHeight = min(
            max((this.mainHeight() * 0.2), DEFAULT_VALUES.cameraDockMinHeight),
            (this.mainHeight() - DEFAULT_VALUES.cameraDockMinHeight),
          );
        } else {
          cameraDockHeight = min(
            max(input.cameraDock.height, DEFAULT_VALUES.cameraDockMinHeight),
            (this.mainHeight() - DEFAULT_VALUES.cameraDockMinHeight),
          );
        }
        cameraDockBounds.top = this.mainHeight() - cameraDockHeight;
        cameraDockBounds.left = sidebarNavWidth;
        cameraDockBounds.minWidth = sidebarContentWidth;
        cameraDockBounds.width = sidebarContentWidth;
        cameraDockBounds.maxWidth = sidebarContentWidth;
        cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
        cameraDockBounds.height = cameraDockHeight;
        cameraDockBounds.maxHeight = this.mainHeight() * 0.8;
        cameraDockBounds.zIndex = 1;
      }
    } else {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;
    }
    return cameraDockBounds;
  }

  calculatesMediaBounds(mediaAreaBounds) {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    const mediaBounds = {};

    if (input.presentation.isFullscreen) {
      mediaBounds.width = this.mainWidth();
      mediaBounds.height = this.mainHeight();
      mediaBounds.top = 0;
      mediaBounds.left = 0;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    if (deviceType === DEVICE_TYPE.MOBILE && input.cameraDock.numCameras > 0) {
      mediaBounds.height = mediaAreaBounds.height * 0.7;
    } else {
      mediaBounds.height = mediaAreaBounds.height;
    }
    mediaBounds.width = mediaAreaBounds.width;
    mediaBounds.top = DEFAULT_VALUES.navBarHeight;
    mediaBounds.left = mediaAreaBounds.left;
    mediaBounds.zIndex = 1;

    return mediaBounds;
  }

  calculatesLayout() {
    const { newLayoutContextState, newLayoutContextDispatch } = this.props;
    const { deviceType, input } = newLayoutContextState;

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
    const mediaBounds = this.calculatesMediaBounds(mediaAreaBounds);
    const cameraDockBounds = this.calculatesCameraDockBounds(
      mediaBounds, mediaAreaBounds, sidebarNavWidth.width, sidebarContentWidth.width,
    );
    const sidebarContentHeight = this.calculatesSidebarContentHeight(cameraDockBounds.height);

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
        top: actionbarBounds.top,
        left: actionbarBounds.left,
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
        right: true,
        bottom: false,
        left: false,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_OUTPUT,
      value: {
        display: input.sidebarContent.isOpen,
        minWidth: sidebarContentWidth.minWidth,
        width: sidebarContentWidth.width,
        maxWidth: sidebarContentWidth.maxWidth,
        height: sidebarContentHeight,
        top: sidebarContentBounds.top,
        left: sidebarContentBounds.left,
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
        right: true,
        bottom: false,
        left: false,
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
        tabOrder: 4,
        isDraggable: false,
        isResizable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        zIndex: cameraDockBounds.zIndex,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_RESIZABLE_EDGE,
      value: {
        top: true,
        right: false,
        bottom: false,
        left: false,
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
