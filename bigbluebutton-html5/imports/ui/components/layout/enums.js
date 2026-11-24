export const LAYOUT_TYPE = {
  UNIFIED_LAYOUT: 'unified',
  CAMERAS_ONLY: 'camerasOnly',
  PRESENTATION_ONLY: 'presentationOnly',
  PARTICIPANTS_AND_CHAT_ONLY: 'participantsAndChatOnly',
  PLUGINS_ONLY: 'pluginsOnly',
  MEDIA_ONLY: 'mediaOnly',
};

export const DEVICE_TYPE = {
  MOBILE: 'mobile',
  TABLET_PORTRAIT: 'tablet_portrait',
  TABLET_LANDSCAPE: 'tablet_landscape',
  TABLET: 'tablet',
  DESKTOP: 'desktop',
};

export const DEVICE_ORIENTATION = {
  PORTRAIT: 'portrait',
  LANDSCAPE: 'landscape',
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
  LAYOUT_TYPE.PLUGINS_ONLY,
  LAYOUT_TYPE.UNIFIED_LAYOUT,
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
  SET_LAYOUT_LOADING: 'setLayoutLoading',

  SET_IS_RTL: 'setIsRTL',
  SET_LAYOUT_TYPE: 'setLayoutType',
  SET_DEVICE_TYPE: 'setDeviceType',
  SET_FONT_SIZE: 'setFontSize',

  SET_FOCUSED_CAMERA_ID: 'focusedId',

  SET_LAYOUT_INPUT: 'setLayoutInput',

  SET_SIDEBAR_CONTENT_PANEL: 'setSidebarcontentPanel',
  SET_SIDEBAR_CONTENT_AUXILIARY_PANEL: 'setSidebarcontentAuxiliaryPanel',

  SET_ID_CHAT_OPEN: 'setIdChatOpen',

  SET_BROWSER_SIZE: 'setBrowserSize',

  SET_HAS_BANNER_BAR: 'setHasBannerBar',
  SET_HAS_NOTIFICATIONS_BAR: 'setHasNotificationsBar',
  SET_HIDE_NOTIFICATION_TOASTS: 'setHideNotificationToasts',

  SET_HAS_NAVBAR: 'setHasNavBar',
  SET_HIDE_NAVBAR_TOP_ROW: 'setHideNavBarTopRow',

  SET_HAS_ACTIONBAR: 'setHasActionBar',

  SET_SIDEBAR_NAVIGATION_IS_OPEN: 'setSidebarNavigationIsOpen',
  SET_SIDEBAR_NAVIGATION_SIZE: 'setSidebarNavigationSize',
  REGISTER_SIDEBAR_APP: 'registerSidebarApp',
  UNREGISTER_SIDEBAR_APP: 'unregisterSidebarApp',
  SET_SIDEBAR_NAVIGATION_PIN_APP: 'setSidebarNavigationPinApp',
  SET_SIDEBAR_NAVIGATION_NOTIFICATION_APP: 'setSidebarNavigationNotificationApp',

  SET_SIDEBAR_CONTENT_IS_OPEN: 'setSidebarContentIsOpen',
  SET_SIDEBAR_CONTENT_SIZE: 'setSidebarContentSize',
  SET_SIDEBAR_CONTENT_PANEL_TYPE: 'setSidebarContentPanelType',
  SET_SIDEBAR_CONTENT_IS_RESIZABLE: 'setSidebarContentIsResizable',

  SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN: 'setSidebarContentAuxiliaryIsOpen',
  SET_SIDEBAR_CONTENT_AUXILIARY_SIZE: 'setSidebarContentAuxiliarySize',
  SET_SIDEBAR_CONTENT_AUXILIARY_IS_RESIZABLE: 'setSidebarContentAuxiliaryIsResizable',


  SET_NUM_CAMERAS: 'setNumCameras',
  SET_CAMERA_DOCK_IS_DRAGGING: 'setCameraDockIsDragging',
  SET_CAMERA_DOCK_IS_RESIZING: 'setCameraDockIsResizing',
  SET_CAMERA_DOCK_POSITION: 'setCameraDockPosition',
  SET_CAMERA_DOCK_SIZE: 'setCameraDockSize',
  SET_CAMERA_DOCK_OPTIMAL_GRID_SIZE: 'setCameraDockOptimalGridSize',
  SET_CAMERA_DOCK_IS_RESIZABLE: 'setCameraDockIsResizable',


  SET_PRESENTATION_IS_OPEN: 'setPresentationIsOpen',
  SET_PRESENTATION_CONTENT_UPDATED: 'setPresentationContentUpdated',
  SET_PRESENTATION_CURRENT_SLIDE_SIZE: 'setPresentationCurrentSlideSize',
  SET_PRESENTATION_NUM_CURRENT_SLIDE: 'setPresentationNumCurrentSlide',
  SET_PRESENTATION_SLIDES_LENGTH: 'setPresentationSlidesLength',
  SET_PRESENTATION_SIZE: 'setPresentationSize',
  SET_PRESENTATION_IS_RESIZABLE: 'setPresentationIsResizable',

  SET_FULLSCREEN_ELEMENT: 'setFullscreenElement',

  SET_HAS_SCREEN_SHARE: 'setHasScreenShare',
  SET_SCREEN_SHARE_SIZE: 'setScreenShareSize',

  SET_HAS_EXTERNAL_VIDEO: 'setHasExternalVideo',
  SET_EXTERNAL_VIDEO_SIZE: 'setExternalVideoSize',

  SET_HAS_GENERIC_CONTENT: 'setHasGenericContent',

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
  PROFILE: 'profile',
  USERLIST: 'userlist',
  CHAT: 'chat',
  SHARED_NOTES: 'shared-notes',
  APPS_GALLERY: 'apps-gallery',
  POLL: 'poll',
  BREAKOUT: 'breakoutroom',
  LEARNING_DASHBOARD: 'learning-dashboard',
  SETTINGS: 'settings',
  CAPTIONS: 'captions',
  TIMER: 'timer',
  GENERIC_CONTENT_SIDEKICK: 'generic-content-sidekick',
  WAITING_USERS: 'waiting-users',
  AUDIO_CAPTIONS: 'audio-captions',
  NONE: 'none',
};
