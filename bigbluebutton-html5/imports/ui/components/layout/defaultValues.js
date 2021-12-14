import { Meteor } from 'meteor/meteor';
import { LAYOUT_TYPE, CAMERADOCK_POSITION, PANELS } from './enums';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

const DEFAULT_VALUES = {
  layoutType: LAYOUT_TYPE.CUSTOM_LAYOUT,
  panelType: 'chat',
  idChatOpen: PUBLIC_CHAT_ID,
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

  sidebarNavMaxWidth: 240,
  sidebarNavMinWidth: 70,
  sidebarNavHeight: '100%',
  sidebarNavTop: 0,
  sidebarNavLeft: 0,
  sidebarNavTabOrder: 1,
  sidebarNavPanel: PANELS.USERLIST,

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
