import React, { Component, Fragment } from 'react';
import { throttle, defaultsDeep } from 'lodash';
import LayoutContext from '../context/context';
import DEFAULT_VALUES from '../defaultValues';
import { INITIAL_INPUT_STATE } from '../context/initState';
import { DEVICE_TYPE, ACTIONS } from '../enums';

// const windowWidth = () => window.document.documentElement.clientWidth;
// const windowHeight = () => window.document.documentElement.clientHeight;
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
    const { input } = newLayoutContextState;
    const { deviceType } = newLayoutContextState;
    if (deviceType === DEVICE_TYPE.MOBILE) {
      newLayoutContextDispatch({
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
      newLayoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: defaultsDeep(
          {
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
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 10 : 2,
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

  calculatesSidebarContentHeight(presentationHeight) {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    let sidebarContentHeight = 0;
    if (input.sidebarContent.isOpen) {
      if (deviceType === DEVICE_TYPE.MOBILE) {
        sidebarContentHeight = this.mainHeight() - DEFAULT_VALUES.navBarHeight;
      } else if (input.cameraDock.numCameras > 0) {
        sidebarContentHeight = this.mainHeight() - presentationHeight;
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

  calculatesCameraDockBounds(mediaAreaBounds) {
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

    if (deviceType === DEVICE_TYPE.MOBILE) {
      cameraDockBounds.minHeight = mediaAreaBounds.height * 0.7;
      cameraDockBounds.height = mediaAreaBounds.height * 0.7;
      cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.7;
    } else {
      cameraDockBounds.minHeight = mediaAreaBounds.height;
      cameraDockBounds.height = mediaAreaBounds.height;
      cameraDockBounds.maxHeight = mediaAreaBounds.height;
    }

    cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
    cameraDockBounds.left = mediaAreaBounds.left;
    cameraDockBounds.minWidth = mediaAreaBounds.width;
    cameraDockBounds.width = mediaAreaBounds.width;
    cameraDockBounds.maxWidth = mediaAreaBounds.width;
    cameraDockBounds.zIndex = 1;
    return cameraDockBounds;
  }

  calculatesPresentationBounds(
    mediaAreaBounds,
    cameraDockBounds,
    sidebarNavWidth,
    sidebarContentWidth,
  ) {
    const { newLayoutContextState } = this.props;
    const { deviceType, input } = newLayoutContextState;
    const presentationBounds = {};

    if (input.presentation.isFullscreen) {
      presentationBounds.width = this.mainWidth();
      presentationBounds.height = this.mainHeight();
      presentationBounds.top = 0;
      presentationBounds.left = 0;
      presentationBounds.zIndex = 99;
      return presentationBounds;
    }

    if (deviceType === DEVICE_TYPE.MOBILE) {
      presentationBounds.height = mediaAreaBounds.height - cameraDockBounds.height;
      presentationBounds.left = mediaAreaBounds.left;
      presentationBounds.top = mediaAreaBounds.top + cameraDockBounds.height;
      presentationBounds.width = mediaAreaBounds.width;
    } else {
      if (input.presentation.height === 0) {
        presentationBounds.height = min(
          max(this.mainHeight() * 0.2, DEFAULT_VALUES.presentationMinHeight),
          this.mainHeight() - DEFAULT_VALUES.presentationMinHeight,
        );
      } else {
        presentationBounds.height = min(
          max(input.presentation.height, DEFAULT_VALUES.presentationMinHeight),
          this.mainHeight() - DEFAULT_VALUES.presentationMinHeight,
        );
      }
      presentationBounds.left = sidebarNavWidth;
      presentationBounds.top = this.mainHeight() - presentationBounds.height;
      presentationBounds.width = sidebarContentWidth;
    }
    presentationBounds.zIndex = 1;
    return presentationBounds;
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
    const cameraDockBounds = this.calculatesCameraDockBounds(mediaAreaBounds);
    const presentationBounds = this.calculatesPresentationBounds(
      mediaAreaBounds, cameraDockBounds, sidebarNavWidth.width, sidebarContentWidth.width,
    );
    const sidebarContentHeight = this.calculatesSidebarContentHeight(
      presentationBounds.height,
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
        isResizable: false,
        zIndex: cameraDockBounds.zIndex,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: input.presentation.isOpen,
        width: presentationBounds.width,
        height: presentationBounds.height,
        top: presentationBounds.top,
        left: presentationBounds.left,
        tabOrder: DEFAULT_VALUES.presentationTabOrder,
        isResizable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        zIndex: presentationBounds.zIndex,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_RESIZABLE_EDGE,
      value: {
        top: true,
        right: false,
        bottom: false,
        left: false,
      },
    });
  }

  render() {
    return <></>;
  }
}

export default LayoutContext.withConsumer(VideoFocusLayout);
