import { INITIAL_INPUT_STATE } from './initState';
import type { Input } from './layoutTypes';
import {
  CAMERADOCK_POSITION, DEVICE_TYPE, LAYOUT_TYPE, PANELS,
} from './enums';

// The cases the layout managers' init() merges were characterized with (reconcile.characterization.test.tsx,
// against the old managers) and that reconcileLayoutInput must reproduce (reconcile.test.ts).
// Each result is a fixture in __fixtures__/reconcile/<name>.json.

/** an input that differs from the initial one wherever a merge could keep or drop a value */
export const PREV_INPUT = {
  ...INITIAL_INPUT_STATE,
  navBar: { ...INITIAL_INPUT_STATE.navBar, hasNavBar: false },
  sidebarNavigation: {
    ...INITIAL_INPUT_STATE.sidebarNavigation,
    isOpen: false,
    width: 70,
    registeredApps: { app: { id: 'app' } },
    pinnedApps: ['app'],
  },
  sidebarContent: {
    ...INITIAL_INPUT_STATE.sidebarContent,
    isOpen: true,
    width: 350,
    sidebarContentPanel: PANELS.USERLIST,
  },
  sidebarContentAuxiliary: {
    ...INITIAL_INPUT_STATE.sidebarContentAuxiliary,
    isOpen: true,
    width: 320,
    sidebarContentPanel: PANELS.SHARED_NOTES,
  },
  cameraDock: {
    ...INITIAL_INPUT_STATE.cameraDock,
    numCameras: 2,
    position: CAMERADOCK_POSITION.CONTENT_LEFT,
    width: 300,
    height: 200,
    focusedId: 'cam-1',
  },
  presentation: {
    ...INITIAL_INPUT_STATE.presentation,
    isOpen: false,
    slidesLength: 3,
    currentSlide: { size: { width: 1600, height: 900 } },
  },
  externalVideo: { ...INITIAL_INPUT_STATE.externalVideo, hasExternalVideo: true },
  genericMainContent: { ...INITIAL_INPUT_STATE.genericMainContent, genericContentId: 'plugin-content' },
  screenShare: {
    ...INITIAL_INPUT_STATE.screenShare, hasScreenShare: true, width: 1280, height: 720,
  },
  sharedNotes: { ...INITIAL_INPUT_STATE.sharedNotes, isPinned: true },
};

export interface ReconcileCase {
  name: string;
  /** the layout rendered before (a switch), or undefined for the first mount */
  from?: string;
  layout: string;
  deviceType: string;
  /** a device type change within the layout, after it mounted */
  deviceFrom?: string;
  /** Session hasLayoutEngineLoadedOnce when init() runs */
  loadedOnce: boolean;
  hideSidebarNavigation?: boolean;
  prev?: Partial<typeof PREV_INPUT>;
}

const desktop = DEVICE_TYPE.DESKTOP;
const mobile = DEVICE_TYPE.MOBILE;

export const CASES: ReconcileCase[] = [
  {
    name: 'unified-first-load', layout: LAYOUT_TYPE.UNIFIED_LAYOUT, deviceType: desktop, loadedOnce: false,
  },
  {
    name: 'unified-first-load-mobile', layout: LAYOUT_TYPE.UNIFIED_LAYOUT, deviceType: mobile, loadedOnce: false,
  },
  {
    name: 'unified-device-change',
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceFrom: DEVICE_TYPE.TABLET_LANDSCAPE,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'unified-panel-none',
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceFrom: DEVICE_TYPE.TABLET_LANDSCAPE,
    deviceType: desktop,
    loadedOnce: true,
    prev: {
      sidebarContent: { ...PREV_INPUT.sidebarContent, isOpen: false, sidebarContentPanel: PANELS.NONE },
      cameraDock: { ...PREV_INPUT.cameraDock, position: '' },
    },
  },
  {
    name: 'unified-from-cameras-only',
    from: LAYOUT_TYPE.CAMERAS_ONLY,
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'unified-from-presentation-only',
    from: LAYOUT_TYPE.PRESENTATION_ONLY,
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'unified-from-media-only',
    from: LAYOUT_TYPE.MEDIA_ONLY,
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'unified-from-participants-and-chat-only',
    from: LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'unified-mobile-device-change',
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceFrom: desktop,
    deviceType: mobile,
    loadedOnce: true,
  },
  {
    name: 'unified-mobile-hide-sidebar-navigation',
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceFrom: desktop,
    deviceType: mobile,
    loadedOnce: true,
    hideSidebarNavigation: true,
  },
  {
    name: 'unified-mobile-from-cameras-only',
    from: LAYOUT_TYPE.CAMERAS_ONLY,
    layout: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceType: mobile,
    loadedOnce: true,
    prev: { sidebarContent: { ...PREV_INPUT.sidebarContent, isOpen: false, sidebarContentPanel: PANELS.NONE } },
  },
  {
    name: 'cameras-only',
    from: LAYOUT_TYPE.UNIFIED_LAYOUT,
    layout: LAYOUT_TYPE.CAMERAS_ONLY,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'cameras-only-first-load', layout: LAYOUT_TYPE.CAMERAS_ONLY, deviceType: desktop, loadedOnce: false,
  },
  {
    name: 'presentation-only',
    from: LAYOUT_TYPE.UNIFIED_LAYOUT,
    layout: LAYOUT_TYPE.PRESENTATION_ONLY,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'presentation-only-first-load', layout: LAYOUT_TYPE.PRESENTATION_ONLY, deviceType: mobile, loadedOnce: false,
  },
  {
    name: 'participants-and-chat-only',
    from: LAYOUT_TYPE.UNIFIED_LAYOUT,
    layout: LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'participants-and-chat-only-panel-none',
    from: LAYOUT_TYPE.UNIFIED_LAYOUT,
    layout: LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
    deviceType: desktop,
    loadedOnce: true,
    prev: { sidebarContent: { ...PREV_INPUT.sidebarContent, sidebarContentPanel: PANELS.NONE } },
  },
  {
    name: 'participants-and-chat-only-first-load',
    layout: LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
    deviceType: desktop,
    loadedOnce: false,
  },
  {
    name: 'media-only',
    from: LAYOUT_TYPE.UNIFIED_LAYOUT,
    layout: LAYOUT_TYPE.MEDIA_ONLY,
    deviceType: desktop,
    loadedOnce: true,
  },
  {
    name: 'media-only-no-position',
    from: LAYOUT_TYPE.UNIFIED_LAYOUT,
    layout: LAYOUT_TYPE.MEDIA_ONLY,
    deviceType: desktop,
    loadedOnce: true,
    prev: { cameraDock: { ...PREV_INPUT.cameraDock, position: '' } },
  },
  {
    name: 'media-only-first-load', layout: LAYOUT_TYPE.MEDIA_ONLY, deviceType: desktop, loadedOnce: false,
  },
  {
    name: 'unknown-layout-type-renders-unified',
    from: LAYOUT_TYPE.CAMERAS_ONLY,
    layout: 'videoFocus',
    deviceType: desktop,
    loadedOnce: true,
  },
];

export const inputFor = (c: ReconcileCase) => ({ ...PREV_INPUT, ...c.prev }) as unknown as Input;

export const fixturePath = (c: ReconcileCase) => `./__fixtures__/reconcile/${c.name}.json`;

/** a stable text for a merged input: the browser size depends on the test window */
export const serialize = (input: object) => `${JSON.stringify({ ...input, browser: '<window>' }, null, 2)}\n`;
