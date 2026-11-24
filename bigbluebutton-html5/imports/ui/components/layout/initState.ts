import DEFAULT_VALUES from '/imports/ui/components/layout/defaultValues';

export const INITIAL_INPUT_STATE = {
  autoarrAngeLayout: true,
  userMetadata: {

  },
  browser: {
    width: window.document.documentElement.clientWidth,
    height: window.document.documentElement.clientHeight,
  },
  bannerBar: {
    hasBanner: false,
  },
  notificationsBar: {
    hasNotification: false,
    hideNotificationToasts: false,
  },
  navBar: {
    hasNavBar: true,
    // bbb_hide_controls hides the nav bar's top row
    hideTopRow: false,
    height: DEFAULT_VALUES.navBarHeight,
  },
  actionBar: {
    hasActionBar: true,
    height: DEFAULT_VALUES.actionBarHeight,
  },
  sidebarNavigation: {
    isOpen: true,
    width: 0,
    height: 0,
    browserWidth: 0,
    registeredApps: {},
    pinnedApps: [],
  },
  sidebarContent: {
    isOpen: true,
    currentPanelType: DEFAULT_VALUES.panelType,
    width: 0,
    height: 0,
    browserWidth: 0,
    sidebarContentPanel: DEFAULT_VALUES.sidebarContentPanel,
    resizableEdge: {
      top: false,
      right: false,
      bottom: false,
      left: false,
    },
  },
  sidebarContentHorizontalResizer: {
    isOpen: true,
    currentPanelType: DEFAULT_VALUES.panelType,
    width: 0,
    height: 0,
    browserWidth: 0,
  },
  sidebarContentAuxiliary: {
    isOpen: false,
    currentPanelType: DEFAULT_VALUES.panelType,
    width: 0,
    height: 0,
    browserWidth: 0,
    sidebarContentPanel: DEFAULT_VALUES.sidebarContentPanel,
    resizableEdge: {
      top: false,
      right: false,
      bottom: false,
      left: false,
    },
  },
  cameraDock: {
    numCameras: 0,
    position: DEFAULT_VALUES.cameraPosition,
    width: 0,
    height: 0,
    browserWidth: 0,
    browserHeight: 0,
    isDragging: false,
    isResizing: false,
    isLocalChange: true,
    cameraOptimalGridSize: {
      width: 0,
      height: 0,
    },
    focusedId: 'none',
  },
  presentation: {
    contentUpdatedAt: 0,
    isOpen: true,
    slidesLength: 0,
    currentSlide: {
      size: {
        width: 0,
        height: 0,
      },
    },
    width: 0,
    height: 0,
    browserWidth: 0,
    browserHeight: 0,
  },
  screenShare: {
    hasScreenShare: false,
    width: 0,
    height: 0,
    browserWidth: 0,
    browserHeight: 0,
  },
  externalVideo: {
    hasExternalVideo: false,
    width: 0,
    height: 0,
    browserWidth: 0,
    browserHeight: 0,
  },
  genericMainContent: {
    genericContentId: undefined,
    width: 0,
    height: 0,
    browserWidth: 0,
    browserHeight: 0,
  },
  sharedNotes: {
    isPinned: false,
    width: 0,
    height: 0,
    browserWidth: 0,
    browserHeight: 0,
  },
};

export default INITIAL_INPUT_STATE;
