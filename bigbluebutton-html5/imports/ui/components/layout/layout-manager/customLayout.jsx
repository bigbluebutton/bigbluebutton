import { useEffect, memo, useRef } from 'react';
import _ from 'lodash';
import LayoutContext from '../context/context';
import DEFAULT_VALUES from '../defaultValues';
import { INITIAL_INPUT_STATE } from '../context/initState';
import { DEVICE_TYPE, ACTIONS, CAMERADOCK_POSITION } from '../enums';
// import slides from '../../presentation/slides-mock';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;
const min = (value1, value2) => (value1 <= value2 ? value1 : value2);
const max = (value1, value2) => (value1 >= value2 ? value1 : value2);

const throttledCalculatesLayout = _.throttle(calculatesLayout => calculatesLayout(),
  50, { trailing: true, leading: true });

const usePrevious = (value) => {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

const CustomLayout = ({ newLayoutContextState, newLayoutContextDispatch }) => {
  const prevDeviceType = usePrevious(newLayoutContextState.deviceType);

  const calculatesNavbarBounds = mediaAreaBounds => ({
    width: windowWidth() - mediaAreaBounds.left,
    height: DEFAULT_VALUES.navBarHeight,
    top: DEFAULT_VALUES.navBarTop,
    left: mediaAreaBounds.left,
    zIndex: 1,
  });

  const calculatesActionbarBounds = (mediaAreaBounds) => {
    const { input } = newLayoutContextState;
    return {
      display: input.actionBar.hasActionBar,
      width: windowWidth() - mediaAreaBounds.left,
      height: DEFAULT_VALUES.actionBarHeight,
      top: windowHeight() - DEFAULT_VALUES.actionBarHeight,
      left: mediaAreaBounds.left,
      zIndex: 1,
    };
  };

  const calculatesSidebarNavWidth = () => {
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
  };

  const calculatesSidebarNavHeight = () => {
    const { input } = newLayoutContextState;
    let sidebarNavHeight = 0;
    if (input.sidebarNavigation.isOpen) {
      sidebarNavHeight = windowHeight();
    }
    return sidebarNavHeight;
  };

  const calculatesSidebarNavBounds = () => {
    const { deviceType } = newLayoutContextState;
    return {
      top: DEFAULT_VALUES.sidebarNavTop,
      left: DEFAULT_VALUES.sidebarNavLeft,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 10 : 2,
    };
  };

  const calculatesSidebarContentWidth = () => {
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
          width = min(max((windowWidth() * 0.2), sidebarContentMinWidth), sidebarContentMaxWidth);
        } else {
          width = min(
            max(input.sidebarContent.width, sidebarContentMinWidth), sidebarContentMaxWidth,
          );
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

  const calculatesSidebarContentHeight = (cameraDockHeight) => {
    const { input } = newLayoutContextState;
    let sidebarContentHeight = 0;
    if (input.sidebarContent.isOpen) {
      if (input.cameraDock.position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM) {
        sidebarContentHeight = windowHeight() - cameraDockHeight;
      } else {
        sidebarContentHeight = windowHeight();
      }
    }
    return sidebarContentHeight;
  };

  const calculatesSidebarContentBounds = (sidebarNavWidth) => {
    const { deviceType } = newLayoutContextState;
    return {
      top: 0,
      left: deviceType === DEVICE_TYPE.MOBILE
        || deviceType === DEVICE_TYPE.TABLET_PORTRAIT ? 0 : sidebarNavWidth,
      zIndex: deviceType === DEVICE_TYPE.MOBILE ? 11 : 2,
    };
  };

  const calculatesMediaAreaBounds = (sidebarNavWidth, sidebarContentWidth) => {
    const { deviceType, input } = newLayoutContextState;
    const { sidebarContent } = input;
    let left = 0;
    let width = 0;
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

    return {
      width,
      height: windowHeight() - (DEFAULT_VALUES.navBarHeight + DEFAULT_VALUES.actionBarHeight),
      top: DEFAULT_VALUES.navBarHeight,
      left,
    };
  };

  const calculatesCameraDockBounds = (sidebarNavWidth, sidebarContentWidth, mediaAreaBounds) => {
    const { input } = newLayoutContextState;

    const cameraDockBounds = {};

    if (input.cameraDock.isFullscreen) {
      cameraDockBounds.width = windowWidth();
      cameraDockBounds.minWidth = windowWidth();
      cameraDockBounds.maxWidth = windowWidth();
      cameraDockBounds.height = windowHeight();
      cameraDockBounds.minHeight = windowHeight();
      cameraDockBounds.maxHeight = windowHeight();
      cameraDockBounds.top = 0;
      cameraDockBounds.left = 0;
      cameraDockBounds.zIndex = 99;
      return cameraDockBounds;
    }

    if (input.cameraDock.numCameras > 0) {
      let cameraDockLeft = 0;
      let cameraDockHeight = 0;
      let cameraDockWidth = 0;
      switch (input.cameraDock.position) {
        case CAMERADOCK_POSITION.CONTENT_TOP:
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
            cameraDockHeight = min(max(input.cameraDock.height, DEFAULT_VALUES.cameraDockMinHeight),
              (mediaAreaBounds.height - DEFAULT_VALUES.cameraDockMinHeight));
          }

          cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
          cameraDockBounds.left = cameraDockLeft;
          cameraDockBounds.minWidth = mediaAreaBounds.width;
          cameraDockBounds.width = mediaAreaBounds.width;
          cameraDockBounds.maxWidth = mediaAreaBounds.width;
          cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
          cameraDockBounds.height = cameraDockHeight;
          cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.8;
          break;
        case CAMERADOCK_POSITION.CONTENT_RIGHT:
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

          cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
          cameraDockBounds.left = input.presentation.isOpen
            ? (mediaAreaBounds.left + mediaAreaBounds.width) - cameraDockWidth
            : mediaAreaBounds.left;
          cameraDockBounds.minWidth = DEFAULT_VALUES.cameraDockMinWidth;
          cameraDockBounds.width = cameraDockWidth;
          cameraDockBounds.maxWidth = mediaAreaBounds.width * 0.8;
          cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
          cameraDockBounds.height = mediaAreaBounds.height;
          cameraDockBounds.maxHeight = mediaAreaBounds.height;
          break;
        case CAMERADOCK_POSITION.CONTENT_BOTTOM:
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
            + mediaAreaBounds.height - cameraDockHeight;
          cameraDockBounds.left = cameraDockLeft;
          cameraDockBounds.minWidth = mediaAreaBounds.width;
          cameraDockBounds.width = mediaAreaBounds.width;
          cameraDockBounds.maxWidth = mediaAreaBounds.width;
          cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
          cameraDockBounds.height = cameraDockHeight;
          cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.8;
          break;
        case CAMERADOCK_POSITION.CONTENT_LEFT:
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

          cameraDockBounds.top = DEFAULT_VALUES.navBarHeight;
          cameraDockBounds.left = mediaAreaBounds.left;
          cameraDockBounds.minWidth = DEFAULT_VALUES.cameraDockMinWidth;
          cameraDockBounds.width = cameraDockWidth;
          cameraDockBounds.maxWidth = mediaAreaBounds.width * 0.8;
          cameraDockBounds.minHeight = mediaAreaBounds.height;
          cameraDockBounds.height = mediaAreaBounds.height;
          cameraDockBounds.maxHeight = mediaAreaBounds.height;
          break;
        case CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM:
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
          cameraDockBounds.left = sidebarNavWidth;
          cameraDockBounds.minWidth = sidebarContentWidth;
          cameraDockBounds.width = sidebarContentWidth;
          cameraDockBounds.maxWidth = sidebarContentWidth;
          cameraDockBounds.minHeight = DEFAULT_VALUES.cameraDockMinHeight;
          cameraDockBounds.height = cameraDockHeight;
          cameraDockBounds.maxHeight = windowHeight() * 0.8;
          break;
        default:
          console.log('default');
      }
      if (input.cameraDock.isDragging) cameraDockBounds.zIndex = 99;
      else cameraDockBounds.zIndex = 1;
    } else {
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;
    }

    return cameraDockBounds;
  };

  const calculatesDropAreas = (sidebarNavWidth, sidebarContentWidth, cameraDockBounds) => {
    const mediaAreaHeight = windowHeight()
      - (DEFAULT_VALUES.navBarHeight + DEFAULT_VALUES.actionBarHeight);
    const mediaAreaWidth = windowWidth() - (sidebarNavWidth + sidebarContentWidth);
    const DROP_ZONE_DEFAUL_SIZE = 100;
    const dropZones = {};

    dropZones[CAMERADOCK_POSITION.CONTENT_TOP] = {
      top: DEFAULT_VALUES.navBarHeight,
      left: sidebarNavWidth
        + sidebarContentWidth,
      width: mediaAreaWidth,
      height: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    dropZones[CAMERADOCK_POSITION.CONTENT_RIGHT] = {
      top: DEFAULT_VALUES.navBarHeight + DROP_ZONE_DEFAUL_SIZE,
      left: windowWidth() - DROP_ZONE_DEFAUL_SIZE,
      height: mediaAreaHeight
        - (2 * DROP_ZONE_DEFAUL_SIZE),
      width: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    dropZones[CAMERADOCK_POSITION.CONTENT_BOTTOM] = {
      top: DEFAULT_VALUES.navBarHeight
        + mediaAreaHeight
        - DROP_ZONE_DEFAUL_SIZE,
      left: sidebarNavWidth + sidebarContentWidth,
      width: mediaAreaWidth,
      height: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    dropZones[CAMERADOCK_POSITION.CONTENT_LEFT] = {
      top: DEFAULT_VALUES.navBarHeight + DROP_ZONE_DEFAUL_SIZE,
      left: sidebarNavWidth + sidebarContentWidth,
      height: mediaAreaHeight
        - (2 * DROP_ZONE_DEFAUL_SIZE),
      width: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    dropZones[CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM] = {
      top: windowHeight() - DROP_ZONE_DEFAUL_SIZE,
      left: sidebarNavWidth,
      width: sidebarContentWidth,
      height: DROP_ZONE_DEFAUL_SIZE,
      zIndex: cameraDockBounds.zIndex,
    };

    return dropZones;
  };

  const calculatesPresentationBounds = (sidebarNavWidth, sidebarContentWidth, cameraDockBounds) => {
    const { input } = newLayoutContextState;
    const mediaAreaHeight = windowHeight() - (
      DEFAULT_VALUES.navBarHeight + DEFAULT_VALUES.actionBarHeight
    );
    const mediaAreaWidth = windowWidth() - (sidebarNavWidth + sidebarContentWidth);
    const presentationBounds = {};

    if (input.presentation.isFullscreen) {
      presentationBounds.width = windowWidth();
      presentationBounds.height = windowHeight();
      presentationBounds.top = 0;
      presentationBounds.left = 0;
      presentationBounds.zIndex = 99;
      return presentationBounds;
    }

    if (input.cameraDock.numCameras > 0 && !input.cameraDock.isDragging) {
      switch (input.cameraDock.position) {
        case CAMERADOCK_POSITION.CONTENT_TOP:
          presentationBounds.width = mediaAreaWidth;
          presentationBounds.height = mediaAreaHeight - cameraDockBounds.height;
          presentationBounds.top = DEFAULT_VALUES.navBarHeight + cameraDockBounds.height;
          presentationBounds.left = sidebarNavWidth + sidebarContentWidth;
          break;
        case CAMERADOCK_POSITION.CONTENT_RIGHT:
          presentationBounds.width = mediaAreaWidth - cameraDockBounds.width;
          presentationBounds.height = mediaAreaHeight;
          presentationBounds.top = DEFAULT_VALUES.navBarHeight;
          presentationBounds.left = sidebarNavWidth + sidebarContentWidth;
          break;
        case CAMERADOCK_POSITION.CONTENT_BOTTOM:
          presentationBounds.width = mediaAreaWidth;
          presentationBounds.height = mediaAreaHeight - cameraDockBounds.height;
          presentationBounds.top = DEFAULT_VALUES.navBarHeight;
          presentationBounds.left = sidebarNavWidth + sidebarContentWidth;
          break;
        case CAMERADOCK_POSITION.CONTENT_LEFT:
          presentationBounds.width = mediaAreaWidth - cameraDockBounds.width;
          presentationBounds.height = mediaAreaHeight;
          presentationBounds.top = DEFAULT_VALUES.navBarHeight;
          presentationBounds.left = sidebarNavWidth
            + sidebarContentWidth + mediaAreaWidth - presentationBounds.width;
          break;
        case CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM:
          presentationBounds.width = mediaAreaWidth;
          presentationBounds.height = mediaAreaHeight;
          presentationBounds.top = DEFAULT_VALUES.navBarHeight;
          presentationBounds.left = sidebarNavWidth + sidebarContentWidth;
          break;
        default:
          console.log('presentation - camera default');
      }
      presentationBounds.zIndex = 1;
    } else {
      presentationBounds.width = mediaAreaWidth;
      presentationBounds.height = mediaAreaHeight;
      presentationBounds.top = DEFAULT_VALUES.navBarHeight;
      presentationBounds.left = sidebarNavWidth + sidebarContentWidth;
    }

    return presentationBounds;
  };

  const calculatesLayout = () => {
    const { deviceType, input } = newLayoutContextState;

    const sidebarNavWidth = calculatesSidebarNavWidth();
    const sidebarNavHeight = calculatesSidebarNavHeight();
    const sidebarContentWidth = calculatesSidebarContentWidth();
    const sidebarNavBounds = calculatesSidebarNavBounds(sidebarNavWidth.width,
      sidebarContentWidth.width);
    const sidebarContentBounds = calculatesSidebarContentBounds(sidebarNavWidth.width,
      sidebarContentWidth.width);
    const mediaAreaBounds = calculatesMediaAreaBounds(sidebarNavWidth.width,
      sidebarContentWidth.width);
    const navbarBounds = calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = calculatesActionbarBounds(mediaAreaBounds);
    const cameraDockBounds = calculatesCameraDockBounds(sidebarNavWidth.width,
      sidebarContentWidth.width, mediaAreaBounds);
    const dropZoneAreas = calculatesDropAreas(sidebarNavWidth.width,
      sidebarContentWidth.width, cameraDockBounds);
    const sidebarContentHeight = calculatesSidebarContentHeight(cameraDockBounds.height);
    const presentationBounds = calculatesPresentationBounds(sidebarNavWidth.width,
      sidebarContentWidth.width, cameraDockBounds);

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
        width: windowWidth() - sidebarNavWidth.width - sidebarContentWidth.width,
        height: windowHeight() - DEFAULT_VALUES.navBarHeight - DEFAULT_VALUES.actionBarHeight,
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
        isDraggable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        isResizable: deviceType !== DEVICE_TYPE.MOBILE
          && deviceType !== DEVICE_TYPE.TABLET,
        zIndex: cameraDockBounds.zIndex,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_CAMERA_DOCK_RESIZABLE_EDGE,
      value: {
        top: input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_BOTTOM
          || input.cameraDock.position === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM,
        right: input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_LEFT,
        bottom: input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_TOP,
        left: input.cameraDock.position === CAMERADOCK_POSITION.CONTENT_RIGHT,
      },
    });

    newLayoutContextDispatch({
      type: ACTIONS.SET_DROP_AREAS,
      value: dropZoneAreas,
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
        isResizable: false,
        zIndex: presentationBounds.zIndex,
      },
    });
  };

  const init = () => {
    const { input } = newLayoutContextState;
    const { deviceType } = newLayoutContextState;
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
    throttledCalculatesLayout(calculatesLayout);
  };

  const resizeEventFunction = () => {
    newLayoutContextDispatch({
      type: ACTIONS.SET_BROWSER_SIZE,
      value: {
        width: window.document.documentElement.clientWidth,
        height: window.document.documentElement.clientHeight,
      },
    });
  };

  useEffect(() => {
    init();
    window.addEventListener('resize', resizeEventFunction);
    // newLayoutContextDispatch({
    //   type: ACTIONS.SET_PRESENTATION_SLIDES_LENGTH,
    //   value: slides.length,
    // });

    return () => window.removeEventListener('resize', resizeEventFunction);
  }, []);

  useEffect(() => {
    if (prevDeviceType !== newLayoutContextState.deviceType) {
      init();
    } else {
      throttledCalculatesLayout(calculatesLayout);
    }
  }, [newLayoutContextState]);

  return null;
};

const MemoCustomLayout = memo(CustomLayout, (props, nextProps) => (
  props.newLayoutContextState.input !== nextProps.newLayoutContextState.input
  || props.newLayoutContextState.deviceType !== nextProps.newLayoutContextState.deviceType
));

export default LayoutContext.withConsumer(MemoCustomLayout);
