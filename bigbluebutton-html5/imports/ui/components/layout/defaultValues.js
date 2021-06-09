import { Meteor } from 'meteor/meteor';
import { LAYOUT_TYPE, CAMERADOCK_POSITION, PANELS } from './enums';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_ID = CHAT_CONFIG.public_id;

const DEFAULT_VALUES = {
  layoutType: LAYOUT_TYPE.CUSTOM_LAYOUT,
  panelType: 'chat',
  idChatOpen: PUBLIC_CHAT_ID,

  cameraPosition: CAMERADOCK_POSITION.CONTENT_TOP,
  cameraDockTabOrder: 4,
  cameraDockMinHeight: 140,
  cameraDockMinWidth: 140,

  presentationTabOrder: 5,
  presentationMinHeight: 220,

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
  sidebarNavPanel: PANELS.USERLIST,

  sidebarContentMaxWidth: 350,
  sidebarContentMinWidth: 150,
  sidebarContentHeight: '100%',
  sidebarContentTop: 0,
  sidebarContentTabOrder: 2,
  sidebarContentPanel: PANELS.CHAT,
};

export default DEFAULT_VALUES;
export {
  LAYOUT_TYPE,
  CAMERADOCK_POSITION,
};
