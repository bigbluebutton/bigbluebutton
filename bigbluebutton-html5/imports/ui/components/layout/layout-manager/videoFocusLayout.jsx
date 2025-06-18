import { useEffect, useRef } from 'react';
import { throttle } from '/imports/utils/throttle';
import {
  layoutDispatch,
  layoutSelect,
  layoutSelectInput,
  layoutSelectOutput,
} from '/imports/ui/components/layout/context';
import DEFAULT_VALUES, { SIDEBAR_CONTENT_MARGIN_TO_MEDIA_PERCENTAGE_WIDTH } from '/imports/ui/components/layout/defaultValues';
import { INITIAL_INPUT_STATE } from '/imports/ui/components/layout/initState';
import {
  ACTIONS, PANELS, LAYOUT_TYPE, DEVICE_TYPE,
} from '/imports/ui/components/layout/enums';
import { defaultsDeep } from '/imports/utils/array-utils';
import Session from '/imports/ui/services/storage/in-memory';
import getFromUserSettings from '/imports/ui/services/users-settings';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;

const VideoFocusLayout = (props) => {
  const {
    prevLayout, bannerAreaHeight, isMobile, calculatesNavbarHeight,
  } = props;

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
  const genericMainContentInput = layoutSelectInput((i) => i.genericMainContent);
  const screenShareInput = layoutSelectInput((i) => i.screenShare);
  const sharedNotesInput = layoutSelectInput((i) => i.sharedNotes);

  const sidebarNavigationInput = layoutSelectInput((i) => i.sidebarNavigation);
  const sidebarContentInput = layoutSelectInput((i) => i.sidebarContent);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const actionbarInput = layoutSelectInput((i) => i.actionBar);
  const navbarInput = layoutSelectInput((i) => i.navBar);
  const layoutContextDispatch = layoutDispatch();

  const sidebarContentOutput = layoutSelectOutput((i) => i.sidebarContent);

  const prevDeviceType = usePrevious(deviceType);
  const isTabletLandscape = deviceType === DEVICE_TYPE.TABLET_LANDSCAPE;
  const { isPresentationEnabled } = props;

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

  useEffect(() => {
    if (deviceType === null) return () => null;

    if (deviceType !== prevDeviceType) {
      // reset layout if deviceType changed
      // not all options is supported in all devices
      init();
    } else {
      throttledCalculatesLayout();
    }
  }, [input, deviceType, isRTL, fontSize, fullscreen, isPresentationEnabled]);

  const init = () => {
    const hasLayoutEngineLoadedOnce = Session.getItem('hasLayoutEngineLoadedOnce');
    layoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_INPUT,
      value: (prevInput) => {
        const {
          sidebarNavigation, sidebarContent, presentation, cameraDock,
          externalVideo, genericMainContent, screenShare, sharedNotes,
        } = prevInput;
        const { sidebarContentPanel } = sidebarContent;
        let sidebarContentPanelOverride = sidebarContentPanel;
        let overrideOpenSidebarPanel = !getFromUserSettings('bbb_hide_sidebar_navigation', false)
          && sidebarContentPanel !== PANELS.NONE;
        let overrideOpenSidebarNavigation = !getFromUserSettings('bbb_hide_sidebar_navigation', false)
          && (sidebarNavigation.isOpen || sidebarContentPanel !== PANELS.NONE || false);
        if ((prevLayout === LAYOUT_TYPE.CAMERAS_ONLY
          || prevLayout === LAYOUT_TYPE.PRESENTATION_ONLY
          || prevLayout === LAYOUT_TYPE.MEDIA_ONLY)
          && !getFromUserSettings('bbb_hide_sidebar_navigation', false)
        ) {
          overrideOpenSidebarNavigation = true;
          overrideOpenSidebarPanel = true;
          sidebarContentPanelOverride = PANELS.CHAT;
        }
        const { registeredApps, pinnedApps } = sidebarNavigation;
        return defaultsDeep(
          {
            sidebarNavigation: {
              isOpen: overrideOpenSidebarNavigation,
              registeredApps,
              pinnedApps,
            },
            sidebarContent: {
              isOpen: overrideOpenSidebarPanel,
              sidebarContentPanel: sidebarContentPanelOverride,
            },
            presentation: {
              isOpen: isTabletLandscape ? false : presentation.isOpen,
              slidesLength: presentation.slidesLength,
              currentSlide: {
                ...presentation.currentSlide,
              },
            },
            cameraDock: {
              numCameras: cameraDock.numCameras,
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
            sharedNotes: {
              isPinned: sharedNotes.isPinned,
            },
          },
          hasLayoutEngineLoadedOnce ? prevInput : INITIAL_INPUT_STATE,
        );
      },
    });
    Session.setItem('layoutReady', true);
    throttledCalculatesLayout();
  };

  const calculatesSidebarContentHeight = () => {
    const { isOpen, slidesLength } = presentationInput;
    const { hasExternalVideo } = externalVideoInput;
    const { genericContentId } = genericMainContentInput;
    const { hasScreenShare } = screenShareInput;
    const { isPinned: isSharedNotesPinned } = sharedNotesInput;

    const navBarHeight = calculatesNavbarHeight();
    const hasPresentation = isPresentationEnabled && slidesLength !== 0;
    const isGeneralMediaOff = !hasPresentation && !hasExternalVideo
      && !hasScreenShare && !isSharedNotesPinned && !genericContentId;

    let minHeight = 0;
    let height = 0;
    let maxHeight = 0;
    if (sidebarContentInput.isOpen) {
      if (isMobile) {
        height = windowHeight() - navBarHeight - bannerAreaHeight();
        minHeight = height;
        maxHeight = height;
      } else if (isOpen && !isGeneralMediaOff && !isTabletLandscape) {
        if (sidebarContentInput.height > 0 && sidebarContentInput.height < windowHeight()) {
          height = sidebarContentInput.height - bannerAreaHeight();
        } else {
          const { size: slideSize } = presentationInput.currentSlide;
          let calculatedHeight = (windowHeight() - bannerAreaHeight()) * 0.3;

          if (slideSize.height > 0 && slideSize.width > 0) {
            calculatedHeight = (slideSize.height * sidebarContentOutput.width) / slideSize.width;
          }
          height = windowHeight() - calculatedHeight - bannerAreaHeight();
        }
        maxHeight = windowHeight() * 0.75 - bannerAreaHeight();
        minHeight = windowHeight() * 0.25 - bannerAreaHeight();

        if (height > maxHeight) {
          height = maxHeight;
        }
      } else {
        height = windowHeight() - bannerAreaHeight();
        maxHeight = height;
        minHeight = height;
      }
    }
    return {
      minHeight,
      height,
      maxHeight,
    };
  };

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

    if (isTabletLandscape && presentationInput.isOpen) {
      // don't show camera dock if presentation is open in tablet landscape mode
      // the sidebar height gets too small, so only one or the other is shown
      cameraDockBounds.width = 0;
      cameraDockBounds.height = 0;
      cameraDockBounds.minWidth = 0;
      cameraDockBounds.maxWidth = 0;
      cameraDockBounds.minHeight = 0;
      cameraDockBounds.maxHeight = 0;
    }

    return cameraDockBounds;
  };

  const calculatesMediaBounds = (
    mediaAreaBounds,
    cameraDockBounds,
    sidebarNavWidth,
    sidebarContentWidth,
    sidebarContentHeight,
  ) => {
    const mediaBounds = {};
    const { element: fullscreenElement } = fullscreen;
    const sidebarSize = sidebarContentWidth.width + sidebarNavWidth.horizontalSpaceOccupied;

    if (
      fullscreenElement === 'Presentation'
      || fullscreenElement === 'Screenshare'
      || fullscreenElement === 'ExternalVideo'
      || fullscreenElement === 'GenericContent'
    ) {
      mediaBounds.width = windowWidth();
      mediaBounds.height = windowHeight();
      mediaBounds.top = 0;
      mediaBounds.left = 0;
      mediaBounds.right = 0;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    if (isMobile) {
      mediaBounds.height = mediaAreaBounds.height - cameraDockBounds.height;
      mediaBounds.left = mediaAreaBounds.left;
      mediaBounds.top = mediaAreaBounds.top + cameraDockBounds.height;
      mediaBounds.width = mediaAreaBounds.width;
    } else if (presentationInput.isOpen) {
      // in tablet landscape, the presentation is shown in the media area
      if (isTabletLandscape) {
        mediaBounds.height = mediaAreaBounds.height;
        mediaBounds.width = mediaAreaBounds.width;
        mediaBounds.top = DEFAULT_VALUES.navBarHeight + bannerAreaHeight();
        mediaBounds.left = !isRTL ? mediaAreaBounds.left : null;
        mediaBounds.right = isRTL ? sidebarSize : null;
        mediaBounds.zIndex = 1;
      } else {
        const sidebarContentMarginToMedia = windowWidth()
          * SIDEBAR_CONTENT_MARGIN_TO_MEDIA_PERCENTAGE_WIDTH;
        mediaBounds.height = windowHeight()
          - sidebarContentHeight - bannerAreaHeight() - sidebarContentMarginToMedia;
        mediaBounds.left = !isRTL ? sidebarNavWidth : 0;
        mediaBounds.right = isRTL ? sidebarNavWidth : 0;
        mediaBounds.top = sidebarContentHeight + bannerAreaHeight() - sidebarContentMarginToMedia;
        mediaBounds.width = sidebarContentWidth - sidebarContentMarginToMedia;
        mediaBounds.zIndex = 1;
      }
    } else if (!presentationInput.isOpen) {
      mediaBounds.width = 0;
      mediaBounds.height = 0;
      mediaBounds.top = 0;
      mediaBounds.left = 0;
    }

    return mediaBounds;
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
    const sidebarContentBounds = calculatesSidebarContentBounds(
      sidebarNavWidth.horizontalSpaceOccupied,
    );
    const mediaAreaBounds = calculatesMediaAreaBounds(
      sidebarNavWidth.horizontalSpaceOccupied,
      sidebarContentWidth.width,
    );
    const navbarBounds = calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = calculatesActionbarBounds(mediaAreaBounds);
    const sidebarSize = sidebarContentWidth.width + sidebarNavWidth.horizontalSpaceOccupied;
    const cameraDockBounds = calculatesCameraDockBounds(mediaAreaBounds, sidebarSize);
    const sidebarContentHeight = calculatesSidebarContentHeight();
    const mediaBounds = calculatesMediaBounds(
      mediaAreaBounds,
      cameraDockBounds,
      sidebarNavWidth.horizontalSpaceOccupied,
      sidebarContentWidth.width,
      sidebarContentHeight.height,
    );

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
        display: sidebarNavigationInput.isOpen,
        width: sidebarNavWidth.width,
        height: sidebarNavHeight,
        top: sidebarNavBounds.top,
        left: sidebarNavBounds.left,
        right: sidebarNavBounds.right,
        tabOrder: DEFAULT_VALUES.sidebarNavTabOrder,
        zIndex: sidebarNavBounds.zIndex,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SIDEBAR_CONTENT_OUTPUT,
      value: {
        display: sidebarContentInput.isOpen,
        minWidth: sidebarContentWidth.minWidth,
        width: sidebarContentWidth.width,
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
        display: presentationInput.isOpen,
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
        display: externalVideoInput.hasExternalVideo,
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
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right : null,
      },
    });
  };

  return null;
};

export default VideoFocusLayout;
