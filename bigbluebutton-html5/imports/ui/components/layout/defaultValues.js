import { LAYOUT_TYPE, CAMERADOCK_POSITION, PANELS } from './enums';

export const SIDEBAR_NAVIGATION_PANEL_WIDTH = 60; // px
export const SIDEBAR_NAVIGATION_MARGIN_PERCENTAGE_WIDTH = 0.01;
export const SIDEBAR_CONTENT_PANEL_MIN_HEIGHT = 300; // px
export const SIDEBAR_CONTENT_VERTICAL_MARGIN_PERCENTAGE_HEIGHT = 0.04;
export const SIDEBAR_CONTENT_PANEL_MIN_WIDTH = 70; // px
export const SIDEBAR_CONTENT_PANEL_MAX_WIDTH = 800; // px
export const SIDEBAR_CONTENT_MARGIN_TO_MEDIA_PERCENTAGE_WIDTH = 0.01;
export const SIDEBAR_NAVIGATION_MARGIN_TO_THE_EDGE_MOBILE = 16; // px

const DEFAULT_VALUES = {
  layoutType: LAYOUT_TYPE.CUSTOM_LAYOUT,
  panelType: 'chat',
  fontSize: 16,

  cameraPosition: CAMERADOCK_POSITION.CONTENT_TOP,
  cameraDockTabOrder: 4,
  cameraDockMinHeight: 120,
  cameraDockMinWidth: 120,
  camerasMargin: 10,
  captionsMargin: 10,

  presentationTabOrder: 5,
  presentationMinHeight: 220,
  presentationToolbarMinWidth: 430,

  bannerHeight: 34,

  navBarHeight: 85,
  navBarTop: 0,
  navBarTabOrder: 3,

  actionBarHeight: 42,
  actionBarPadding: 11.2,
  actionBarTabOrder: 6,

  sidebarNavWidthMobile: 48, // px
  sidebarNavMarginToTheEdgeMobile: 16, // px
  sidebarNavHeightPercentage: 1,
  sidebarNavHeightPercentageMobile: 0.80,
  sidebarNavTop: 0,
  sidebarNavLeft: 0,
  sidebarNavTabOrder: 1,

  sidebarContentMaxWidth: SIDEBAR_CONTENT_PANEL_MAX_WIDTH,
  sidebarContentMinWidth: SIDEBAR_CONTENT_PANEL_MIN_WIDTH,
  sidebarContentMinHeight: SIDEBAR_CONTENT_PANEL_MIN_HEIGHT,
  sidebarContentTop: 0,
  sidebarContentTabOrder: 2,
  sidebarContentPanel: PANELS.NONE,
};

export default DEFAULT_VALUES;
export {
  LAYOUT_TYPE,
  CAMERADOCK_POSITION,
};
