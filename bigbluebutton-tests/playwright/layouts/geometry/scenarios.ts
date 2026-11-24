import type { DeviceProfile, DockPosition } from '../layoutDriver';

// The geometry golden matrix: a pairwise subset of viewport x layout x presentation x sidebar x dock
// position x cameras x RTL x banner x hidden bars x fullscreen x mid-drag. Each scenario is captured
// on the unchanged client (dist-base) and compared at +-2 px per edge on every later build.

export const VIEWPORTS = {
  fullHd: { width: 1920, height: 1080 },
  laptop: { width: 1366, height: 768 },
  hd: { width: 1280, height: 720 },
  tablet: { width: 1024, height: 768 },
  tabletPortrait: { width: 800, height: 1000 },
  phone: { width: 390, height: 844, phone: true },
  phoneLandscape: { width: 844, height: 390, phone: true },
} satisfies Record<string, DeviceProfile>;

export type Cameras = 0 | 1 | 2 | 'avatars';

export interface Scenario {
  id: string;
  profile: DeviceProfile;
  /** meetingLayout on create; unified when absent */
  layout?: 'CAMERAS_ONLY' | 'PRESENTATION_ONLY' | 'PARTICIPANTS_AND_CHAT_ONLY' | 'MEDIA_ONLY';
  cameras?: Cameras;
  dock?: DockPosition;
  presentation?: 'open' | 'minimized';
  sidebar?: 'default' | 'closed' | 'userList' | 'auxiliary';
  rtl?: boolean;
  banner?: boolean;
  hideNavBar?: boolean;
  hideActionsBar?: boolean;
  hideControls?: boolean;
  webcamsFullscreen?: boolean;
  midDrag?: boolean;
  /** per-region tolerance in px, each with the reason it needs one */
  tolerance?: Record<string, { px: number; reason: string }>;
}

const { fullHd, laptop, hd, tablet, tabletPortrait, phone, phoneLandscape } = VIEWPORTS;

export const SCENARIOS: Scenario[] = [
  // unified, no cameras, across viewports
  { id: 'unified-1920', profile: fullHd },
  { id: 'unified-1366', profile: laptop },
  { id: 'unified-1280', profile: hd },
  { id: 'unified-1024', profile: tablet },
  { id: 'unified-800x1000', profile: tabletPortrait },
  { id: 'unified-phone', profile: phone },
  { id: 'unified-phone-landscape', profile: phoneLandscape },
  // sidebar states
  { id: 'unified-1366-sidebar-closed', profile: laptop, sidebar: 'closed' },
  { id: 'unified-1920-userlist', profile: fullHd, sidebar: 'userList' },
  { id: 'unified-1366-auxiliary', profile: laptop, sidebar: 'auxiliary' },
  { id: 'unified-1280-avatars', profile: hd, cameras: 'avatars', presentation: 'minimized' },
  // one camera at each dock position
  { id: 'dock-top-1366', profile: laptop, cameras: 1, dock: 'contentTop' },
  { id: 'dock-right-1366', profile: laptop, cameras: 1, dock: 'contentRight' },
  { id: 'dock-bottom-1366', profile: laptop, cameras: 1, dock: 'contentBottom' },
  { id: 'dock-left-1366', profile: laptop, cameras: 1, dock: 'contentLeft' },
  { id: 'dock-sidebar-1366', profile: laptop, cameras: 1, dock: 'sidebarContentBottom' },
  { id: 'dock-top-1920-two-cameras', profile: fullHd, cameras: 2, dock: 'contentTop' },
  { id: 'dock-left-1024', profile: tablet, cameras: 1, dock: 'contentLeft' },
  { id: 'dock-right-800x1000', profile: tabletPortrait, cameras: 1, dock: 'contentRight' },
  { id: 'dock-bottom-1280-sidebar-closed', profile: hd, cameras: 1, dock: 'contentBottom', sidebar: 'closed' },
  { id: 'dock-1280-presentation-minimized', profile: hd, cameras: 1, presentation: 'minimized' },
  { id: 'camera-phone', profile: phone, cameras: 1 },
  { id: 'camera-phone-landscape', profile: phoneLandscape, cameras: 1 },
  // RTL
  { id: 'rtl-1366', profile: laptop, rtl: true },
  { id: 'rtl-1366-dock-right', profile: laptop, rtl: true, cameras: 1, dock: 'contentRight' },
  { id: 'rtl-1366-dock-left', profile: laptop, rtl: true, cameras: 1, dock: 'contentLeft' },
  { id: 'mid-drag-1366-rtl', profile: laptop, rtl: true, cameras: 1, midDrag: true },
  {
    id: 'rtl-1920-userlist-dock-sidebar',
    profile: fullHd,
    rtl: true,
    sidebar: 'userList',
    cameras: 1,
    dock: 'sidebarContentBottom',
  },
  // banner and hidden bars
  { id: 'banner-1366', profile: laptop, banner: true },
  { id: 'banner-1280-camera', profile: hd, banner: true, cameras: 1 },
  { id: 'hide-nav-bar-1366', profile: laptop, hideNavBar: true },
  { id: 'hide-actions-bar-1366', profile: laptop, hideActionsBar: true },
  { id: 'hide-controls-1366', profile: laptop, hideControls: true },
  // bbb_hide_controls also removes the actions bar (observer.tsx), so this one has no camera button
  { id: 'hide-controls-1024', profile: tablet, hideControls: true },
  // fullscreen and mid-drag
  { id: 'webcams-fullscreen-1366', profile: laptop, cameras: 1, webcamsFullscreen: true },
  { id: 'mid-drag-1366', profile: laptop, cameras: 1, midDrag: true },
  { id: 'mid-drag-1024-sidebar-closed', profile: tablet, cameras: 1, midDrag: true, sidebar: 'closed' },
  // the special layouts
  { id: 'cameras-only-1366-camera', profile: laptop, layout: 'CAMERAS_ONLY', cameras: 1 },
  { id: 'cameras-only-1920', profile: fullHd, layout: 'CAMERAS_ONLY' },
  { id: 'presentation-only-1366', profile: laptop, layout: 'PRESENTATION_ONLY' },
  { id: 'presentation-only-phone', profile: phone, layout: 'PRESENTATION_ONLY' },
  { id: 'participants-and-chat-only-1366', profile: laptop, layout: 'PARTICIPANTS_AND_CHAT_ONLY' },
  { id: 'participants-and-chat-only-800x1000', profile: tabletPortrait, layout: 'PARTICIPANTS_AND_CHAT_ONLY' },
  { id: 'media-only-1366', profile: laptop, layout: 'MEDIA_ONLY' },
  { id: 'media-only-1920-camera', profile: fullHd, layout: 'MEDIA_ONLY', cameras: 1 },
  { id: 'media-only-1024-camera-rtl', profile: tablet, layout: 'MEDIA_ONLY', cameras: 1, rtl: true },
];
