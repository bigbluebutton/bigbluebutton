import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import LayoutContext from '../context/context';
import DEFAULT_VALUES from '../defaultValues';
import { INITIAL_INPUT_STATE } from '../context/initState';
import { DEVICE_TYPE, ACTIONS } from '../enums';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;
const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

class SmartLayout extends Component {
  constructor(props) {
    super(props);

    this.throttledCalculatesLayout = _.throttle(() => this.calculatesLayout(),
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
    if (prevProps.newLayoutContextState.deviceType !== deviceType
      || newLayoutContextState.layoutLoaded !== prevProps.newLayoutContextState.layoutLoaded) {
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
        value: _.defaultsDeep({
          sidebarNavigation: {
            isOpen: false,
          },
          sidebarContent: {
            isOpen: false,
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
        }, INITIAL_INPUT_STATE),
      });
    }
    if (deviceType !== DEVICE_TYPE.MOBILE) {
      newLayoutContextDispatch({
        type: ACTIONS.SET_LAYOUT_INPUT,
        value: _.defaultsDeep({
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
    if (layoutLoaded === 'both') top = windowHeight() / 2;
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
    const { contextState } = this.props;
    const { input } = contextState;
    return {
      display: input.actionBar.hasActionBar,
      width: windowWidth() - mediaAreaBounds.left,
      height: DEFAULT_VALUES.actionBarHeight,
      top: windowHeight() - DEFAULT_VALUES.actionBarHeight,
      left: mediaAreaBounds.left,
      zIndex: 1,
    };
  }

  calculatesSidebarNavWidth() {
    const { contextState } = this.props;
    const { deviceType, input } = contextState;
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
    const { contextState } = this.props;
    const { input } = contextState;
    let sidebarNavHeight = 0;
    if (input.sidebarNavigation.isOpen) {
      sidebarNavHeight = windowHeight();
    }
    return sidebarNavHeight;
  }

  calculatesSidebarNavBounds() {
    const { newLayoutContextState } = this.props;
    const { deviceType, layoutLoaded } = newLayoutContextState;

    let top = 0;
    if (layoutLoaded === 'both') top = windowHeight() / 2;
    else top = DEFAULT_VALUES.sidebarNavTop;

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
        minWidth = windowWidth();
        width = windowWidth();
        maxWidth = windowWidth();
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
    const { input } = newLayoutContextState;
    let sidebarContentHeight = 0;
    if (input.sidebarContent.isOpen) {
      sidebarContentHeight = windowHeight();
    }
    return sidebarContentHeight;
  }

  calculatesSidebarContentBounds(sidebarNavWidth) {
    const { newLayoutContextState } = this.props;
    const { deviceType, layoutLoaded } = newLayoutContextState;

    let top = 0;
    if (layoutLoaded === 'both') top = windowHeight() / 2;
    else top = DEFAULT_VALUES.sidebarNavTop;

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
      width = windowWidth();
    } else if (deviceType === DEVICE_TYPE.TABLET_PORTRAIT) {
      if (sidebarContent.isOpen) {
        left = sidebarContentWidth;
        width = windowWidth() - sidebarContentWidth;
      } else {
        left = sidebarNavWidth;
        width = windowWidth() - sidebarNavWidth;
      }
    } else {
      left = sidebarNavWidth + sidebarContentWidth;
      width = windowWidth() - sidebarNavWidth - sidebarContentWidth;
    }

    if (layoutLoaded === 'both') top = windowHeight() / 2;
    else top = DEFAULT_VALUES.navBarHeight;

    return {
      width,
      height: windowHeight() - (DEFAULT_VALUES.navBarHeight + DEFAULT_VALUES.actionBarHeight),
      top,
      left,
    };
  }

  calculatesCameraDockBounds(mediaAreaBounds, presentationBounds) {
    const { newLayoutContextState } = this.props;
    const { input } = newLayoutContextState;

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
      cameraDockBounds.top = mediaAreaBounds.top;
      cameraDockBounds.left = mediaAreaBounds.left;
      cameraDockBounds.zIndex = 1;

      if (presentationBounds.width < mediaAreaBounds.width) {
        cameraDockBounds.width = mediaAreaBounds.width - presentationBounds.width;
        cameraDockBounds.maxWidth = mediaAreaBounds.width * 0.8;
        cameraDockBounds.height = mediaAreaBounds.height;
        cameraDockBounds.maxHeight = mediaAreaBounds.height;
      } else {
        cameraDockBounds.width = mediaAreaBounds.width;
        cameraDockBounds.maxWidth = mediaAreaBounds.width;
        cameraDockBounds.height = mediaAreaBounds.height - presentationBounds.height;
        cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.8;
      }

      cameraDockBounds.minWidth = DEFAULT_VALUES.cameraDockMinWidth;
      cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
    } else {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;
    }

    return cameraDockBounds;
  }

  calculatesSlideSize(mediaAreaBounds) {
    const { contextState } = this.props;
    const { input } = contextState;
    const { presentation } = input;
    const { currentSlide } = presentation;

    if (currentSlide.size.width === 0 && currentSlide.size.height === 0) {
      return {
        width: 0,
        height: 0,
      };
    }

    let slideWidth;
    let slideHeight;

    slideWidth = (currentSlide.size.width * mediaAreaBounds.height) / currentSlide.size.height;
    slideHeight = mediaAreaBounds.height;

    if (slideWidth > mediaAreaBounds.width) {
      slideWidth = mediaAreaBounds.width;
      slideHeight = (currentSlide.size.height * mediaAreaBounds.width) / currentSlide.size.width;
    }

    return {
      width: slideWidth,
      height: slideHeight,
    };
  }

  calculatesPresentationBounds(mediaAreaBounds, slideSize) {
    const { contextState } = this.props;
    const { input } = contextState;
    const presentationBounds = {};

    // TODO Adicionar min e max para a apresentação

    if (input.presentation.isFullscreen) {
      presentationBounds.width = windowWidth();
      presentationBounds.height = windowHeight();
      presentationBounds.top = 0;
      presentationBounds.left = 0;
      presentationBounds.zIndex = 99;
      return presentationBounds;
    }

    if (input.cameraDock.numCameras > 0 && !input.cameraDock.isDragging) {
      if (slideSize.width !== 0 && slideSize.height !== 0) {
        if (slideSize.width < mediaAreaBounds.width) {
          if (slideSize.width < (mediaAreaBounds.width * 0.8)) {
            presentationBounds.width = slideSize.width;
          } else {
            presentationBounds.width = mediaAreaBounds.width * 0.8;
          }
          presentationBounds.height = mediaAreaBounds.height;
          presentationBounds.top = mediaAreaBounds.top;
          presentationBounds.left = mediaAreaBounds.left
            + (mediaAreaBounds.width - presentationBounds.width);
        } else {
          if (slideSize.height < (mediaAreaBounds.height * 0.8)) {
            presentationBounds.height = slideSize.height;
          } else {
            presentationBounds.height = mediaAreaBounds.height * 0.8;
          }
          presentationBounds.width = mediaAreaBounds.width;
          presentationBounds.top = mediaAreaBounds.top
            + (mediaAreaBounds.height - presentationBounds.height);
          presentationBounds.left = mediaAreaBounds.left;
        }
      } else {
        presentationBounds.width = mediaAreaBounds.width;
        presentationBounds.height = mediaAreaBounds.height * 0.8;
        presentationBounds.top = mediaAreaBounds.top
          + (mediaAreaBounds.height - presentationBounds.height);
        presentationBounds.left = mediaAreaBounds.left;
      }
    } else {
      presentationBounds.width = mediaAreaBounds.width;
      presentationBounds.height = mediaAreaBounds.height;
      presentationBounds.top = mediaAreaBounds.top;
      presentationBounds.left = mediaAreaBounds.left;
    }
    presentationBounds.zIndex = 1;

    return presentationBounds;
  }

  calculatesLayout() {
    const { contextState, contextDispatch } = this.props;
    const { deviceType, input } = contextState;

    const sidebarNavWidth = this.calculatesSidebarNavWidth();
    const sidebarNavHeight = this.calculatesSidebarNavHeight();
    const sidebarContentWidth = this.calculatesSidebarContentWidth();
    const sidebarContentHeight = this.calculatesSidebarContentHeight();
    const sidebarNavBounds = this
      .calculatesSidebarNavBounds(sidebarNavWidth.width, sidebarContentWidth.width);
    const sidebarContentBounds = this
      .calculatesSidebarContentBounds(sidebarNavWidth.width, sidebarContentWidth.width);
    const mediaAreaBounds = this
      .calculatesMediaAreaBounds(sidebarNavWidth.width, sidebarContentWidth.width);
    const navbarBounds = this.calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = this.calculatesActionbarBounds(mediaAreaBounds);
    const slideSize = this.calculatesSlideSize(mediaAreaBounds);
    const presentationBounds = this.calculatesPresentationBounds(mediaAreaBounds, slideSize);
    const cameraDockBounds = this.calculatesCameraDockBounds(mediaAreaBounds, presentationBounds);

    contextDispatch({
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

    contextDispatch({
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

    contextDispatch({
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

    contextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_RESIZABLE_EDGE,
      value: {
        top: false,
        right: true,
        bottom: false,
        left: false,
      },
    });

    contextDispatch({
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

    contextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE,
      value: {
        top: false,
        right: true,
        bottom: false,
        left: false,
      },
    });

    contextDispatch({
      type: ACTIONS.SET_MEDIA_AREA_SIZE,
      value: {
        width: mediaAreaBounds.width,
        height: mediaAreaBounds.height,
      },
    });

    contextDispatch({
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

    contextDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: input.presentation.isOpen,
        width: presentationBounds.width,
        height: presentationBounds.height,
        top: presentationBounds.top,
        left: presentationBounds.left,
        tabOrder: DEFAULT_VALUES.presentationTabOrder,
        isResizable: false,
        zIndex: presentationBounds.zIndex,
      },
    });
  }


  render() {
    return (
      <Fragment />
    );
  }
}

export default LayoutContext.withConsumer(SmartLayout);
