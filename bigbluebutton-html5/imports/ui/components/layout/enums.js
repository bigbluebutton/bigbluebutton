export const LAYOUT_TYPE = {
  CUSTOM_LAYOUT: 'custom',
  SMART_LAYOUT: 'smart',
  PRESENTATION_FOCUS: 'presentationFocus',
  VIDEO_FOCUS: 'videoFocus',
  CAMERAS_ONLY: 'camerasOnly',
  PRESENTATION_ONLY: 'presentationOnly',
  PARTICIPANTS_AND_CHAT_ONLY: 'participantsAndChatOnly',
  MEDIA_ONLY: 'mediaOnly',
};

export const DEVICE_TYPE = {
  MOBILE: 'mobile',
  TABLET_PORTRAIT: 'tablet_portrait',
  TABLET_LANDSCAPE: 'tablet_landscape',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
};

export const SMALL_VIEWPORT_BREAKPOINT = 640;

export const MEDIA_ONLY_LAYOUT_MARGIN = 10;

export const CAMERADOCK_POSITION = {
  CONTENT_TOP: 'contentTop',
  CONTENT_RIGHT: 'contentRight',
  CONTENT_BOTTOM: 'contentBottom',
  CONTENT_LEFT: 'contentLeft',
  SIDEBAR_CONTENT_BOTTOM: 'sidebarContentBottom',
};

// list of layouts that are only available through join parameters
export const HIDDEN_LAYOUTS = [
  LAYOUT_TYPE.CAMERAS_ONLY,
  LAYOUT_TYPE.PRESENTATION_ONLY,
  LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
  LAYOUT_TYPE.MEDIA_ONLY,
];

export const LAYOUT_ELEMENTS = {
  LAYOUT_TYPE: 'layoutType',
  PRESENTATION_STATE: 'presentationState',
  FOCUSED_CAMERA: 'focusedCamera',
  CAMERA_DOCK_SIZE: 'cameraDockSize',
  CAMERA_DOCK_POSITION: 'cameradockPosition',
};

export const SYNC = {
  PROPAGATE_ELEMENTS: 'propagateElements',
  REPLICATE_ELEMENTS: 'replicateElements',
};

export const ACTIONS = {
  SET_AUTO_ARRANGE_LAYOUT: 'setAutoArrangeLayout',
  SET_IS_RTL: 'setIsRTL',
  SET_LAYOUT_TYPE: 'setLayoutType',
  SET_DEVICE_TYPE: 'setDeviceType',
  SET_FONT_SIZE: 'setFontSize',

  SET_FOCUSED_CAMERA_ID: 'focusedId',

  SET_LAYOUT_INPUT: 'setLayoutInput',

  SET_SIDEBAR_NAVIGATION_PANEL: 'setSidebarNavigationPanel',
  SET_SIDEBAR_CONTENT_PANEL: 'setSidebarcontentPanel',

  SET_ID_CHAT_OPEN: 'setIdChatOpen',

  SET_BROWSER_SIZE: 'setBrowserSize',

  SET_HAS_BANNER_BAR: 'setHasBannerBar',
  SET_HAS_NOTIFICATIONS_BAR: 'setHasNotificationsBar',
  SET_HIDE_NOTIFICATION_TOASTS: 'setHideNotificationToasts',

  SET_HAS_NAVBAR: 'setHasNavBar',
  SET_HIDE_NAVBAR_TOP_ROW: 'setHideNavBarTopRow',
  SET_NAVBAR_OUTPUT: 'setNavBarOutput',

  SET_HAS_ACTIONBAR: 'setHasActionBar',
  SET_ACTIONBAR_OUTPUT: 'setActionBarOutput',

  SET_SIDEBAR_NAVIGATION_IS_OPEN: 'setSidebarNavigationIsOpen',
  SET_SIDEBAR_NAVIGATION_SIZE: 'setSidebarNavigationSize',
  SET_SIDEBAR_NAVIGATION_OUTPUT: 'setSidebarNavigationOutput',
  SET_SIDEBAR_NAVIGATION_IS_RESIZABLE: 'setSidebarNavigationIsResizable',
  SET_SIDEBAR_NAVIGATION_RESIZABLE_EDGE: 'setSidebarNavigationResizableEdge',

  SET_SIDEBAR_CONTENT_IS_OPEN: 'setSidebarContentIsOpen',
  SET_SIDEBAR_CONTENT_SIZE: 'setSidebarContentSize',
  SET_SIDEBAR_CONTENT_PANEL_TYPE: 'setSidebarContentPanelType',
  SET_SIDEBAR_CONTENT_OUTPUT: 'setSidebarContentOutput',
  SET_SIDEBAR_CONTENT_IS_RESIZABLE: 'setSidebarContentIsResizable',
  SET_SIDEBAR_CONTENT_RESIZABLE_EDGE: 'setSidebarContentResizableEdge',

  SET_MEDIA_AREA_SIZE: 'setMediaAreaSize',

  SET_NUM_CAMERAS: 'setNumCameras',
  SET_CAMERA_DOCK_IS_DRAGGING: 'setCameraDockIsDragging',
  SET_CAMERA_DOCK_IS_RESIZING: 'setCameraDockIsResizing',
  SET_CAMERA_DOCK_POSITION: 'setCameraDockPosition',
  SET_CAMERA_DOCK_SIZE: 'setCameraDockSize',
  SET_CAMERA_DOCK_OPTIMAL_GRID_SIZE: 'setCameraDockOptimalGridSize',
  SET_CAMERA_DOCK_OUTPUT: 'setCameraDockOutput',
  SET_CAMERA_DOCK_IS_DRAGGABLE: 'setCameraDockIsDraggable',
  SET_CAMERA_DOCK_IS_RESIZABLE: 'setCameraDockIsResizable',
  SET_CAMERA_DOCK_RESIZABLE_EDGE: 'setCameraDockResizableEdge',

  SET_DROP_AREAS: 'setDropAreas',

  SET_PRESENTATION_IS_OPEN: 'setPresentationIsOpen',
  SET_PRESENTATION_CURRENT_SLIDE_SIZE: 'setPresentationCurrentSlideSize',
  SET_PRESENTATION_NUM_CURRENT_SLIDE: 'setPresentationNumCurrentSlide',
  SET_PRESENTATION_SLIDES_LENGTH: 'setPresentationSlidesLength',
  SET_PRESENTATION_SIZE: 'setPresentationSize',
  SET_PRESENTATION_OUTPUT: 'setPresentationOutput',
  SET_PRESENTATION_IS_RESIZABLE: 'setPresentationIsResizable',
  SET_PRESENTATION_RESIZABLE_EDGE: 'setPresentationResizableEdge',

  SET_FULLSCREEN_ELEMENT: 'setFullscreenElement',

  SET_HAS_SCREEN_SHARE: 'setHasScreenShare',
  SET_SCREEN_SHARE_SIZE: 'setScreenShareSize',
  SET_SCREEN_SHARE_OUTPUT: 'setScreenShareOutput',

  SET_HAS_EXTERNAL_VIDEO: 'setHasExternalVideo',
  SET_EXTERNAL_VIDEO_SIZE: 'setExternalVideoSize',
  SET_EXTERNAL_VIDEO_OUTPUT: 'setExternalVideoOutput',

  SET_HAS_GENERIC_CONTENT: 'setHasGenericContent',
  SET_GENERIC_CONTENT_OUTPUT: 'setGenericContentOutput',

  SET_SHARED_NOTES_OUTPUT: 'setSharedNotesOutput',
  SET_NOTES_IS_PINNED: 'setNotesIsPinned',

  SET_PILE_CONTENT_FOR_PRESENTATION_AREA: 'setPileContentForPresentationArea',
};

export const PRESENTATION_AREA = {
  GENERIC_CONTENT: 'genericContent',
  PINNED_NOTES: 'pinnedNotes',
  EXTERNAL_VIDEO: 'externalVideo',
  SCREEN_SHARE: 'screenShare',
  WHITEBOARD_OPEN: 'whiteboardOpen',
};

export const PANELS = {
  USERLIST: 'userlist',
  CHAT: 'chat',
  POLL: 'poll',
  CAPTIONS: 'captions',
  BREAKOUT: 'breakoutroom',
  SHARED_NOTES: 'shared-notes',
  TIMER: 'timer',
  WAITING_USERS: 'waiting-users',
  GENERIC_CONTENT_SIDEKICK: 'generic-content-sidekick',
  NONE: 'none',
};
