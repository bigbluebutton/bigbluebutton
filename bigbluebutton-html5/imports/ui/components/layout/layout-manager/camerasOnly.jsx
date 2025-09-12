import { useEffect, useRef } from 'react';
import { throttle } from '/imports/utils/throttle';
import {
  layoutDispatch,
  layoutSelect,
  layoutSelectInput,
} from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { INITIAL_INPUT_STATE } from '/imports/ui/components/layout/initState';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import { defaultsDeep } from '/imports/utils/array-utils';
import Session from '/imports/ui/services/storage/in-memory';

const CamerasOnlyLayout = (props) => {
  const { bannerAreaHeight, isMobile, calculatesNavbarHeight } = props;

  function usePrevious(value) {
    const ref = useRef();
    useEffect(() => {
      ref.current = value;
    });
    return ref.current;
  }

  const input = layoutSelect((i) => i.input);
  const deviceType = layoutSelect((i) => i.deviceType);
  const isRTL = layoutSelect((i) => i.isRTL);
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const fontSize = layoutSelect((i) => i.fontSize);
  const currentPanelType = layoutSelect((i) => i.currentPanelType);
  const navbarInput = layoutSelectInput((i) => i.navBar);
  const actionbarInput = layoutSelectInput((i) => i.actionBar);
  const layoutContextDispatch = layoutDispatch();
  const prevDeviceType = usePrevious(deviceType);

  const calculatesCameraDockBounds = (mediaAreaBounds, sidebarSize) => {
    const { baseCameraDockBounds } = props;

    const baseBounds = baseCameraDockBounds(mediaAreaBounds, sidebarSize);

    // do not proceed if using values from LayoutEngine
    if (Object.keys(baseBounds).length > 0) {
      return baseBounds;
    }

    const navBarHeight = calculatesNavbarHeight();

    const cameraDockBounds = {};

    const mobileCameraHeight = mediaAreaBounds.height * 0.7 - bannerAreaHeight();
    const cameraHeight = mediaAreaBounds.height - bannerAreaHeight();

    if (isMobile) {
      cameraDockBounds.minHeight = mobileCameraHeight;
      cameraDockBounds.height = mobileCameraHeight;
      cameraDockBounds.maxHeight = mobileCameraHeight;
    } else {
      cameraDockBounds.minHeight = cameraHeight;
      cameraDockBounds.height = cameraHeight;
      cameraDockBounds.maxHeight = cameraHeight;
    }

    cameraDockBounds.top = navBarHeight + bannerAreaHeight();
    cameraDockBounds.left = !isRTL ? mediaAreaBounds.left : null;
    cameraDockBounds.right = isRTL ? sidebarSize : null;
    cameraDockBounds.minWidth = mediaAreaBounds.width;
    cameraDockBounds.width = mediaAreaBounds.width;
    cameraDockBounds.maxWidth = mediaAreaBounds.width;
    cameraDockBounds.zIndex = 1;

    return cameraDockBounds;
  };

  const calculatesMediaBounds = () => {
    const mediaBounds = {};
    mediaBounds.width = 0;
    mediaBounds.height = 0;
    mediaBounds.top = 0;
    mediaBounds.left = 0;

    return mediaBounds;
  };

  const calculatesSidebarContentHeight = () => ({
    minHeight: 0,
    height: 0,
    maxHeight: 0,
  });

  const calculatesLayout = () => {
    const {
      calculatesNavbarBounds,
      calculatesActionbarBounds,
      calculatesSidebarNavWidth,
      calculatesSidebarNavHeight,
      calculatesSidebarNavBounds,
      calculatesSidebarContentWidth,
      calculatesSidebarContentBounds,
      calculatesMediaAreaBounds,
      isTablet,
    } = props;
    const { captionsMargin } = DEFAULT_VALUES;

    const sidebarNavWidth = calculatesSidebarNavWidth();
    const sidebarNavHeight = calculatesSidebarNavHeight();
    const sidebarContentWidth = calculatesSidebarContentWidth();
    const sidebarNavBounds = calculatesSidebarNavBounds();
    const sidebarContentBounds = calculatesSidebarContentBounds(sidebarNavWidth.width);
    const mediaAreaBounds = calculatesMediaAreaBounds(
      sidebarNavWidth.width,
      sidebarContentWidth.width,
    );
    const navbarBounds = calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = calculatesActionbarBounds(mediaAreaBounds);
    const sidebarSize = sidebarContentWidth.width + sidebarNavWidth.width;
    const cameraDockBounds = calculatesCameraDockBounds(mediaAreaBounds, sidebarSize);
    const sidebarContentHeight = calculatesSidebarContentHeight();
    const mediaBounds = calculatesMediaBounds();

    layoutContextDispatch({
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

    layoutContextDispatch({
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

    layoutContextDispatch({
      type: ACTIONS.SET_CAPTIONS_OUTPUT,
      value: {
        left: !isRTL ? sidebarSize + captionsMargin : null,
        right: isRTL ? sidebarSize + captionsMargin : null,
        maxWidth: mediaAreaBounds.width - captionsMargin * 2,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_OUTPUT,
      value: {
        display: false,
        minWidth: 0,
        width: 0,
        maxWidth: sidebarNavWidth.maxWidth,
        height: sidebarNavHeight,
        top: sidebarNavBounds.top,
        left: sidebarNavBounds.left,
        right: sidebarNavBounds.right,
        tabOrder: DEFAULT_VALUES.sidebarNavTabOrder,
        isResizable: !isMobile && !isTablet,
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
        display: false,
        minWidth: 0,
        width: 0,
        maxWidth: sidebarContentWidth.maxWidth,
        minHeight: sidebarContentHeight.minHeight,
        height: sidebarContentHeight.height,
        maxHeight: sidebarContentHeight.maxHeight,
        top: sidebarContentBounds.top,
        left: sidebarContentBounds.left,
        right: sidebarContentBounds.right,
        currentPanelType,
        tabOrder: DEFAULT_VALUES.sidebarContentTabOrder,
        isResizable: !isMobile && !isTablet,
        zIndex: sidebarContentBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_RESIZABLE_EDGE,
      value: {
        top: false,
        right: !isRTL,
        bottom: true,
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
        display: true,
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
        focusedId: input.cameraDock.focusedId,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: false,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right : null,
        tabOrder: DEFAULT_VALUES.presentationTabOrder,
        isResizable: !isMobile && !isTablet,
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
        display: false,
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
        display: false,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right : null,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_GENERIC_CONTENT_OUTPUT,
      value: {
        display: false,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right : null,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SHARED_NOTES_OUTPUT,
      value: {
        display: false,
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right : null,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN,
      value: false,
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
      value: false,
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
      value: PANELS.NONE,
    });
  };

  const throttledCalculatesLayout = throttle(() => calculatesLayout(), 50, {
    trailing: true,
    leading: true,
  });

  useEffect(() => {
    window.addEventListener('resize', () => {
      layoutContextDispatch({
        type: ACTIONS.SET_BROWSER_SIZE,
        value: {
          width: window.document.documentElement.clientWidth,
          height: window.document.documentElement.clientHeight,
        },
      });
    });
  }, []);

  const init = () => {
    const hasLayoutEngineLoadedOnce = Session.getItem('hasLayoutEngineLoadedOnce');
    layoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_INPUT,
      value: (prevInput) => {
        const { cameraDock } = prevInput;
        return defaultsDeep(
          {
            sidebarNavigation: {
              isOpen: false,
              width: 0,
              height: 0,
            },
            sidebarContent: {
              isOpen: false,
              width: 0,
              height: 0,
            },
            presentation: {
              isOpen: false,
            },
            cameraDock: {
              numCameras: cameraDock.numCameras,
            },
            externalVideo: {
              hasExternalVideo: false,
            },
            genericMainContent: {
              genericContentId: undefined,
            },
            screenShare: {
              hasScreenShare: false,
            },
          },
          hasLayoutEngineLoadedOnce ? prevInput : INITIAL_INPUT_STATE,
        );
      },
    });
    Session.setItem('layoutReady', true);
    throttledCalculatesLayout();
  };

  // eslint-disable-next-line consistent-return
  useEffect(() => {
    if (deviceType === null) return () => null;

    if (deviceType !== prevDeviceType) {
      // reset layout if deviceType changed
      // not all options is supported in all devices
      init();
    } else {
      throttledCalculatesLayout();
    }
  }, [input, deviceType, isRTL, fontSize, fullscreen]);
  return null;
};

export default CamerasOnlyLayout;
