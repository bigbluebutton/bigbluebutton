import { LAYOUT_TYPE, CAMERADOCK_POSITION } from './enums';

const DEFAULT_VALUES = {
  layoutType: LAYOUT_TYPE.CUSTOM_LAYOUT,
  panelType: 'chat',

  cameraPosition: CAMERADOCK_POSITION.CONTENT_TOP,
  cameraDockTabOrder: 4,
  cameraDockMinHeight: 140,
  cameraDockMinWidth: 140,

  presentationTabOrder: 5,
  presentationMinHeight: 140,

  navBarHeight: 85,
  navBarTop: 0,
  navBarTabOrder: 3,

  actionBarHeight: 65,
  actionBarTabOrder: 6,

  sidebarNavMaxWidth: 240,
  sidebarNavMinWidth: 150,
  sidebarNavHeight: '100%',
  sidebarNavTop: 0,
  sidebarNavLeft: 0,
  sidebarNavTabOrder: 1,

  sidebarContentMaxWidth: 350,
  sidebarContentMinWidth: 150,
  sidebarContentHeight: '100%',
  sidebarContentTop: 0,
  sidebarContentTabOrder: 2,
};

export default DEFAULT_VALUES;
export {
  LAYOUT_TYPE,
  CAMERADOCK_POSITION,
};
