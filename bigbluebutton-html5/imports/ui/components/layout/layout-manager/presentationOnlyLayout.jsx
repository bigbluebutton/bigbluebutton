import { useEffect, useRef } from 'react';
import { throttle } from '/imports/utils/throttle';
import { layoutDispatch, layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { INITIAL_INPUT_STATE } from '/imports/ui/components/layout/initState';
import {
  ACTIONS,
  PANELS,
  CAMERADOCK_POSITION,
} from '/imports/ui/components/layout/enums';
import { defaultsDeep } from '/imports/utils/array-utils';
import Session from '/imports/ui/services/storage/in-memory';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;

const PresentationOnlyLayout = (props) => {
  const { bannerAreaHeight, calculatesNavbarHeight, isMobile } = props;

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

  const presentationInput = layoutSelectInput((i) => i.presentation);
  const externalVideoInput = layoutSelectInput((i) => i.externalVideo);
  const actionbarInput = layoutSelectInput((i) => i.actionBar);
  const navbarInput = layoutSelectInput((i) => i.navBar);
  const layoutContextDispatch = layoutDispatch();

  const prevDeviceType = usePrevious(deviceType);

  const calculatesMediaBounds = (mediaAreaBounds, sidebarSize) => {
    const mediaBounds = {};
    const { element: fullscreenElement } = fullscreen;

    const navBarHeight = calculatesNavbarHeight();

    if (
      fullscreenElement === 'Presentation'
      || fullscreenElement === 'Screenshare'
      || fullscreenElement === 'ExternalVideo'
      || fullscreenElement === 'GenericContent'
    ) {
      mediaBounds.width = windowWidth();
      mediaBounds.height = windowHeight();
      mediaBounds.top = 0;
      mediaBounds.left = !isRTL ? 0 : null;
      mediaBounds.right = isRTL ? 0 : null;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    mediaBounds.height = mediaAreaBounds.height;
    mediaBounds.width = mediaAreaBounds.width;
    mediaBounds.top = navBarHeight + bannerAreaHeight();
    mediaBounds.left = !isRTL ? mediaAreaBounds.left : null;
    mediaBounds.right = isRTL ? sidebarSize : null;
    mediaBounds.zIndex = 1;

    return mediaBounds;
  };

  const calculatesSidebarContentHeight = () => ({
    height: 0,
    minHeight: 0,
    maxHeight: 0,
  });

  const calculatesCameraDockBounds = () => {
    const cameraDockBounds = {};

    cameraDockBounds.top = 0;
    cameraDockBounds.left = 0;
    cameraDockBounds.right = 0;
    cameraDockBounds.minWidth = 0;
    cameraDockBounds.width = 0;
    cameraDockBounds.maxWidth = 0;
    cameraDockBounds.minHeight = 0;
    cameraDockBounds.height = 0;
    cameraDockBounds.maxHeight = 0;

    return cameraDockBounds;
  };

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
    const mediaBounds = calculatesMediaBounds(mediaAreaBounds, sidebarSize);
    const sidebarContentHeight = calculatesSidebarContentHeight();
    const cameraDockBounds = calculatesCameraDockBounds();
    const { isOpen } = presentationInput;

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
        bottom: false,
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
        display: false,
        position: CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM,
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
        focusedId: input.cameraDock.focusedId,
        zIndex: cameraDockBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_PRESENTATION_OUTPUT,
      value: {
        display: true,
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

    layoutContextDispatch({
      type: ACTIONS.SET_SCREEN_SHARE_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: isOpen ? mediaBounds.height : 0,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: mediaBounds.right,
        zIndex: mediaBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_EXTERNAL_VIDEO_OUTPUT,
      value: {
        display: externalVideoInput.hasExternalVideo,
        width: isOpen ? mediaBounds.width : 0,
        height: isOpen ? mediaBounds.height : 0,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: mediaBounds.right,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_GENERIC_CONTENT_OUTPUT,
      value: {
        width: isOpen ? mediaBounds.width : 0,
        height: isOpen ? mediaBounds.height : 0,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: mediaBounds.right,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SHARED_NOTES_OUTPUT,
      value: {
        width: isOpen ? mediaBounds.width : 0,
        height: isOpen ? mediaBounds.height : 0,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: mediaBounds.right,
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

  const throttledCalculatesLayout = throttle(() => calculatesLayout(),
    50, { trailing: true, leading: true });

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
        const {
          presentation, externalVideo, genericMainContent, screenShare,
        } = prevInput;
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
              isOpen: true,
              slidesLength: presentation.slidesLength,
              currentSlide: {
                ...presentation.currentSlide,
              },
            },
            cameraDock: {
              numCameras: prevInput.cameraDock.numCameras,
            },
            externalVideo: {
              hasExternalVideo: externalVideo.hasExternalVideo,
            },
            genericMainContent: {
              genericContentId: genericMainContent.genericContentId,
            },
            screenShare: {
              hasScreenShare: screenShare.hasScreenShare,
              width: screenShare.width,
              height: screenShare.height,
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

export default PresentationOnlyLayout;
