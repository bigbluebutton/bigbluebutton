import { useEffect, useRef } from 'react';
import { throttle } from '/imports/utils/throttle';
import { layoutDispatch, layoutSelect, layoutSelectInput } from '/imports/ui/components/layout/context';
import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';
import { INITIAL_INPUT_STATE } from '/imports/ui/components/layout/initState';
import { ACTIONS, PANELS, CAMERADOCK_POSITION } from '/imports/ui/components/layout/enums';
import { defaultsDeep } from '/imports/utils/array-utils';
import Session from '/imports/ui/services/storage/in-memory';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';

const windowWidth = () => window.document.documentElement.clientWidth;
const windowHeight = () => window.document.documentElement.clientHeight;

const SmartLayout = (props) => {
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
  const Settings = getSettingsSingletonInstance();
  const { isRTL } = Settings.application;
  const fullscreen = layoutSelect((i) => i.fullscreen);
  const fontSize = layoutSelect((i) => i.fontSize);
  const currentPanelType = layoutSelect((i) => i.currentPanelType);

  const presentationInput = layoutSelectInput((i) => i.presentation);
  const sidebarNavigationInput = layoutSelectInput((i) => i.sidebarNavigation);
  const sidebarContentInput = layoutSelectInput((i) => i.sidebarContent);
  const cameraDockInput = layoutSelectInput((i) => i.cameraDock);
  const actionbarInput = layoutSelectInput((i) => i.actionBar);
  const navbarInput = layoutSelectInput((i) => i.navBar);
  const externalVideoInput = layoutSelectInput((i) => i.externalVideo);
  const genericMainContentInput = layoutSelectInput((i) => i.genericMainContent);
  const screenShareInput = layoutSelectInput((i) => i.screenShare);
  const sharedNotesInput = layoutSelectInput((i) => i.sharedNotes);
  const layoutContextDispatch = layoutDispatch();

  const prevDeviceType = usePrevious(deviceType);
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
    layoutContextDispatch({
      type: ACTIONS.SET_LAYOUT_INPUT,
      value: (prevInput) => {
        const {
          sidebarNavigation, sidebarContent, presentation, cameraDock,
          externalVideo, genericMainContent, screenShare, sharedNotes,
        } = prevInput;
        const { sidebarContentPanel } = sidebarContent;
        return defaultsDeep(
          {
            sidebarNavigation: {
              isOpen:
                sidebarNavigation.isOpen || sidebarContentPanel !== PANELS.NONE || false,
            },
            sidebarContent: {
              isOpen: sidebarContentPanel !== PANELS.NONE,
              sidebarContentPanel,
            },
            SidebarContentHorizontalResizer: {
              isOpen: false,
            },
            presentation: {
              isOpen: presentation.isOpen,
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
          INITIAL_INPUT_STATE,
        );
      },
    });
    Session.setItem('layoutReady', true);
    throttledCalculatesLayout();
  };

  const calculatesSidebarContentHeight = () => {
    let sidebarContentHeight = 0;
    if (sidebarContentInput.isOpen) {
      if (isMobile) {
        sidebarContentHeight = windowHeight() - DEFAULT_VALUES.navBarHeight;
      } else {
        sidebarContentHeight = windowHeight();
      }
      sidebarContentHeight -= bannerAreaHeight();
    }
    return sidebarContentHeight;
  };

  const calculatesCameraDockBounds = (mediaAreaBounds, mediaBounds, sidebarSize) => {
    const { baseCameraDockBounds } = props;

    const baseBounds = baseCameraDockBounds(mediaAreaBounds, sidebarSize);

    // do not proceed if using values from LayoutEngine
    if (Object.keys(baseBounds).length > 0) {
      baseBounds.isCameraHorizontal = false;
      return baseBounds;
    }

    const { camerasMargin, presentationToolbarMinWidth } = DEFAULT_VALUES;
    const navBarHeight = calculatesNavbarHeight();

    const cameraDockBounds = {};

    cameraDockBounds.isCameraHorizontal = false;

    const mediaBoundsWidth =
      mediaBounds.width > presentationToolbarMinWidth && !isMobile
        ? mediaBounds.width
        : presentationToolbarMinWidth;

    cameraDockBounds.top = navBarHeight;
    cameraDockBounds.left = mediaAreaBounds.left;
    cameraDockBounds.right = isRTL ? sidebarSize : null;
    cameraDockBounds.zIndex = 1;

    if (mediaBounds.width < mediaAreaBounds.width) {
      cameraDockBounds.top = navBarHeight + bannerAreaHeight();
      cameraDockBounds.width = mediaAreaBounds.width - mediaBoundsWidth;
      cameraDockBounds.maxWidth = mediaAreaBounds.width * 0.8;
      cameraDockBounds.height = mediaAreaBounds.height;
      cameraDockBounds.maxHeight = mediaAreaBounds.height;
      cameraDockBounds.left += camerasMargin;
      cameraDockBounds.width -= camerasMargin * 2;
      cameraDockBounds.isCameraHorizontal = true;
      cameraDockBounds.position = CAMERADOCK_POSITION.CONTENT_LEFT;
      // button size in vertical position
      cameraDockBounds.height -= 20;
    } else {
      cameraDockBounds.width = mediaAreaBounds.width;
      cameraDockBounds.maxWidth = mediaAreaBounds.width;
      cameraDockBounds.height = mediaAreaBounds.height - mediaBounds.height;
      cameraDockBounds.maxHeight = mediaAreaBounds.height * 0.8;
      cameraDockBounds.top += camerasMargin;
      cameraDockBounds.height -= camerasMargin * 2;
      cameraDockBounds.position = CAMERADOCK_POSITION.CONTENT_TOP;
    }

    cameraDockBounds.minWidth = cameraDockBounds.width;
    cameraDockBounds.minHeight = cameraDockBounds.height;

    return cameraDockBounds;
  };

  const calculatesSlideSize = (mediaAreaBounds) => {
    const { currentSlide } = presentationInput;

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
  };

  const calculatesScreenShareSize = (mediaAreaBounds) => {
    const { width = 0, height = 0 } = screenShareInput;

    if (width === 0 && height === 0) return { width, height };

    let screeShareWidth;
    let screeShareHeight;

    screeShareWidth = (width * mediaAreaBounds.height) / height;
    screeShareHeight = mediaAreaBounds.height;

    if (screeShareWidth > mediaAreaBounds.width) {
      screeShareWidth = mediaAreaBounds.width;
      screeShareHeight = (height * mediaAreaBounds.width) / width;
    }

    return {
      width: screeShareWidth,
      height: screeShareHeight,
    };
  };

  const calculatesMediaBounds = (mediaAreaBounds, slideSize, sidebarSize, screenShareSize) => {
    const { isOpen, slidesLength } = presentationInput;
    const { hasExternalVideo } = externalVideoInput;
    const { genericContentId } = genericMainContentInput;
    const { hasScreenShare } = screenShareInput;
    const { isPinned: isSharedNotesPinned } = sharedNotesInput;

    const hasPresentation = isPresentationEnabled && slidesLength !== 0;
    const isGeneralMediaOff = !hasPresentation && !hasExternalVideo
      && !hasScreenShare && !isSharedNotesPinned && !genericContentId;

    const mediaBounds = {};
    const { element: fullscreenElement } = fullscreen;

    if (!isOpen || isGeneralMediaOff) {
      mediaBounds.width = 0;
      mediaBounds.height = 0;
      mediaBounds.top = 0;
      mediaBounds.left = !isRTL ? 0 : null;
      mediaBounds.right = isRTL ? 0 : null;
      mediaBounds.zIndex = 0;
      return mediaBounds;
    }

    if (
      fullscreenElement === 'Presentation' ||
      fullscreenElement === 'Screenshare' ||
      fullscreenElement === 'ExternalVideo' ||
      fullscreenElement === 'GenericContent'
    ) {
      mediaBounds.width = windowWidth();
      mediaBounds.height = windowHeight();
      mediaBounds.top = 0;
      mediaBounds.left = !isRTL ? 0 : null;
      mediaBounds.right = isRTL ? 0 : null;
      mediaBounds.zIndex = 99;
      return mediaBounds;
    }

    const mediaContentSize = hasScreenShare ? screenShareSize : slideSize;

    if (cameraDockInput.numCameras > 0 && !cameraDockInput.isDragging) {
      if (mediaContentSize.width !== 0 && mediaContentSize.height !== 0 
        && !hasExternalVideo && !genericContentId) {
        if (mediaContentSize.width < mediaAreaBounds.width && !isMobile) {
          if (mediaContentSize.width < mediaAreaBounds.width * 0.8) {
            mediaBounds.width = mediaContentSize.width;
          } else {
            mediaBounds.width = mediaAreaBounds.width * 0.8;
          }
          mediaBounds.height = mediaAreaBounds.height;
          mediaBounds.top = mediaAreaBounds.top;
          const sizeValue = mediaAreaBounds.left + (mediaAreaBounds.width - mediaBounds.width);
          mediaBounds.left = !isRTL ? sizeValue : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
        } else {
          if (mediaContentSize.height < mediaAreaBounds.height * 0.8) {
            mediaBounds.height = mediaContentSize.height;
          } else {
            mediaBounds.height = mediaAreaBounds.height * 0.8;
          }
          mediaBounds.width = mediaAreaBounds.width;
          mediaBounds.top = mediaAreaBounds.top + (mediaAreaBounds.height - mediaBounds.height);
          const sizeValue = mediaAreaBounds.left;
          mediaBounds.left = !isRTL ? sizeValue : null;
          mediaBounds.right = isRTL ? sidebarSize : null;
        }
      } else {
        mediaBounds.width = mediaAreaBounds.width;
        mediaBounds.height = mediaAreaBounds.height * 0.8;
        mediaBounds.top = mediaAreaBounds.top + (mediaAreaBounds.height - mediaBounds.height);
        const sizeValue = mediaAreaBounds.left;
        mediaBounds.left = !isRTL ? sizeValue : null;
        mediaBounds.right = isRTL ? sidebarSize : null;
      }
    } else {
      mediaBounds.width = mediaAreaBounds.width;
      mediaBounds.height = mediaAreaBounds.height;
      mediaBounds.top = mediaAreaBounds.top;
      const sizeValue = mediaAreaBounds.left;
      mediaBounds.left = !isRTL ? sizeValue : null;
      mediaBounds.right = isRTL ? sidebarSize : null;
    }
    mediaBounds.zIndex = 1;

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
    const { camerasMargin, captionsMargin } = DEFAULT_VALUES;

    const sidebarNavWidth = calculatesSidebarNavWidth();
    const sidebarNavHeight = calculatesSidebarNavHeight();
    const sidebarContentWidth = calculatesSidebarContentWidth();
    const sidebarContentHeight = calculatesSidebarContentHeight();
    const sidebarNavBounds = calculatesSidebarNavBounds();
    const sidebarContentBounds = calculatesSidebarContentBounds(sidebarNavWidth.width);
    const mediaAreaBounds = calculatesMediaAreaBounds(
      sidebarNavWidth.width,
      sidebarContentWidth.width
    );
    const navbarBounds = calculatesNavbarBounds(mediaAreaBounds);
    const actionbarBounds = calculatesActionbarBounds(mediaAreaBounds);
    const slideSize = calculatesSlideSize(mediaAreaBounds);
    const screenShareSize = calculatesScreenShareSize(mediaAreaBounds);
    const sidebarSize = sidebarContentWidth.width + sidebarNavWidth.width;
    const mediaBounds = calculatesMediaBounds(
      mediaAreaBounds,
      slideSize,
      sidebarSize,
      screenShareSize
    );
    const cameraDockBounds = calculatesCameraDockBounds(mediaAreaBounds, mediaBounds, sidebarSize);
    const horizontalCameraDiff = cameraDockBounds.isCameraHorizontal
      ? cameraDockBounds.width + camerasMargin * 2
      : 0;

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
        minWidth: sidebarNavWidth.minWidth,
        width: sidebarNavWidth.width,
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
        display: sidebarContentInput.isOpen,
        minWidth: sidebarContentWidth.minWidth,
        width: sidebarContentWidth.width,
        maxWidth: sidebarContentWidth.maxWidth,
        height: sidebarContentHeight,
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
        display: cameraDockInput.numCameras > 0,
        position: cameraDockBounds.position,
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
        right: isRTL ? mediaBounds.right + horizontalCameraDiff : null,
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
        right: isRTL ? mediaBounds.right + horizontalCameraDiff : null,
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
        right: isRTL ? mediaBounds.right + horizontalCameraDiff : null,
      },
    });
    
    layoutContextDispatch({
      type: ACTIONS.SET_GENERIC_CONTENT_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right + horizontalCameraDiff : null,
      },
    });

    layoutContextDispatch({
      type: ACTIONS.SET_SHARED_NOTES_OUTPUT,
      value: {
        width: mediaBounds.width,
        height: mediaBounds.height,
        top: mediaBounds.top,
        left: mediaBounds.left,
        right: isRTL ? mediaBounds.right + horizontalCameraDiff : null,
      },
    });
  };

  return null;
};

export default SmartLayout;