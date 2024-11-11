import { LAYOUT_TYPE, CAMERADOCK_POSITION, PANELS } from './enums';

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

  sidebarNavWidth: 60,
  sidebarNavWidthMobile: 48,
  sidebarNavHeightPercentage: 0.97,
  sidebarNavHeightPercentageMobile: 0.80,
  sidebarNavHorizontalMargin: 24, // px
  sidebarNavHorizontalMarginMobile: 5, // px
  sidebarNavTop: 0,
  sidebarNavLeft: 0,
  sidebarNavTabOrder: 1,

  sidebarContentMaxWidth: 800,
  sidebarContentMinWidth: 70,
  sidebarContentMinHeight: 200,
  sidebarContentHeight: '100%',
  sidebarContentTop: 0,
  sidebarContentTabOrder: 2,
  sidebarContentPanel: PANELS.NONE,
};

export default DEFAULT_VALUES;
export {
  LAYOUT_TYPE,
  CAMERADOCK_POSITION,
};
