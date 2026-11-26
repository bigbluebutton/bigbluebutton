import { LAYOUT_TYPE, CAMERADOCK_POSITION, PANELS } from './enums';

const SIDEBAR_NAVIGATION_PANEL_WIDTH = 60; // px
export const SIDEBAR_NAVIGATION_MARGIN_PERCENTAGE_WIDTH = 0.01;
export const SIDEBAR_CONTENT_VERTICAL_MARGIN_PERCENTAGE_HEIGHT = 0.04;
// Minimum sidebar content width: 4.72 × SIDEBAR_NAVIGATION_PANEL_WIDTH = 283.2 px
const SIDEBAR_CONTENT_PANEL_MIN_WIDTH = SIDEBAR_NAVIGATION_PANEL_WIDTH * 4.72;
const SIDEBAR_CONTENT_PANEL_MAX_WIDTH = 800; // px
export const SIDEBAR_CONTENT_MARGIN_TO_MEDIA_PERCENTAGE_WIDTH = 0.01;

// The layout's sizes and positions are in the CSS layout (layout/shell/styles.ts); these are the
// values the layout state and the sidebar resize still use.
const DEFAULT_VALUES = {
  layoutType: LAYOUT_TYPE.UNIFIED_LAYOUT,
  fontSize: 16,
  cameraPosition: CAMERADOCK_POSITION.CONTENT_TOP,
  navBarHeight: 85,
  actionBarHeight: 42,
  sidebarContentMaxWidth: SIDEBAR_CONTENT_PANEL_MAX_WIDTH,
  sidebarContentMinWidth: SIDEBAR_CONTENT_PANEL_MIN_WIDTH,
  sidebarContentPanel: PANELS.NONE,
};

export default DEFAULT_VALUES;
export {
  LAYOUT_TYPE,
};
