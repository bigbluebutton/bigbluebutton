import { describe, expect, it } from 'vitest';
import { reducer } from './context';
import {
  ACTIONS, CAMERADOCK_POSITION, LAYOUT_TYPE, PANELS, PRESENTATION_AREA,
} from './enums';
import { INITIAL_INPUT_STATE } from './initState';

// Characterization of the reducer's semantic (input) cases, the ones the CSS layout keeps.
// Several cases mutate nested input objects in place, so every test starts from a deep clone.

interface PileValue {
  content: string;
  open: boolean;
  genericContentId?: string;
}

interface PileItem {
  type: string;
  value: PileValue;
}

interface LayoutState {
  presentationAreaContentActions: PileItem[];
  deviceType: string;
  isRTL: boolean;
  layoutType: string;
  layoutLoading: boolean;
  fontSize: number;
  idChatOpen: string;
  fullscreen: { element: string; group: string };
  input: typeof INITIAL_INPUT_STATE;
}

const freshState = (): LayoutState => ({
  presentationAreaContentActions: [{
    type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA,
    value: { content: PRESENTATION_AREA.WHITEBOARD_OPEN, open: true },
  }],
  deviceType: 'desktop',
  isRTL: false,
  layoutType: LAYOUT_TYPE.UNIFIED_LAYOUT,
  layoutLoading: true,
  fontSize: 14,
  idChatOpen: '',
  fullscreen: { element: '', group: '' },
  input: structuredClone(INITIAL_INPUT_STATE),
});

// The reducer is untyped JavaScript: its result is read back as the state shape the tests build.
const reduce = (state: LayoutState, action: Record<string, unknown>): LayoutState => reducer(state, action);

const dispatch = (state: LayoutState, type: string, value: unknown, extra: Record<string, unknown> = {}) => (
  reduce(state, { type, value, ...extra })
);

// Reads a dotted path, for the table-driven cases whose paths are data
const get = (obj: unknown, path: string): unknown => path.split('.').reduce<unknown>(
  (o, k) => (o !== null && typeof o === 'object' ? (o as Record<string, unknown>)[k] : undefined),
  obj,
);

// action, path written, a value different from the initial one
const simpleSetters: [string, string, unknown][] = [
  [ACTIONS.SET_IS_RTL, 'isRTL', true],
  [ACTIONS.SET_FONT_SIZE, 'fontSize', 18],
  [ACTIONS.SET_ID_CHAT_OPEN, 'idChatOpen', 'chat-1'],
  [ACTIONS.SET_DEVICE_TYPE, 'deviceType', 'mobile'],
  [ACTIONS.SET_LAYOUT_LOADING, 'layoutLoading', false],
  [ACTIONS.SET_HAS_BANNER_BAR, 'input.bannerBar.hasBanner', true],
  [ACTIONS.SET_HAS_NOTIFICATIONS_BAR, 'input.notificationsBar.hasNotification', true],
  [ACTIONS.SET_HIDE_NOTIFICATION_TOASTS, 'input.notificationsBar.hideNotificationToasts', true],
  [ACTIONS.SET_HAS_NAVBAR, 'input.navBar.hasNavBar', false],
  [ACTIONS.SET_HAS_ACTIONBAR, 'input.actionBar.hasActionBar', false],
  [ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN, 'input.sidebarNavigation.isOpen', false],
  [ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_PANEL, 'input.sidebarContentAuxiliary.sidebarContentPanel', PANELS.POLL],
  [ACTIONS.SET_NUM_CAMERAS, 'input.cameraDock.numCameras', 3],
  [ACTIONS.SET_CAMERA_DOCK_IS_DRAGGING, 'input.cameraDock.isDragging', true],
  [ACTIONS.SET_PRESENTATION_SLIDES_LENGTH, 'input.presentation.slidesLength', 12],
  [ACTIONS.SET_HAS_SCREEN_SHARE, 'input.screenShare.hasScreenShare', true],
  [ACTIONS.SET_HAS_EXTERNAL_VIDEO, 'input.externalVideo.hasExternalVideo', true],
  [ACTIONS.SET_HAS_GENERIC_CONTENT, 'input.genericMainContent.genericContentId', 'plugin-1'],
  [ACTIONS.SET_NOTES_IS_PINNED, 'input.sharedNotes.isPinned', true],
];

describe('layout reducer: semantic input cases', () => {
  describe.each(simpleSetters)('%s', (type, path, value) => {
    it(`writes ${path}`, () => {
      const next = dispatch(freshState(), type, value);
      expect(get(next, path)).toEqual(value);
    });

    it('returns the same state object when the value does not change', () => {
      const state = dispatch(freshState(), type, value);
      expect(dispatch(state, type, value)).toBe(state);
    });
  });

  it('SET_LAYOUT_TYPE ignores the type already set, and stores a new one', () => {
    const state = freshState();
    const next = dispatch(state, ACTIONS.SET_LAYOUT_TYPE, LAYOUT_TYPE.UNIFIED_LAYOUT);
    expect(next).toBe(state);
    expect(next.layoutType).toBe(LAYOUT_TYPE.UNIFIED_LAYOUT);
    expect(dispatch(next, ACTIONS.SET_LAYOUT_TYPE, LAYOUT_TYPE.MEDIA_ONLY).layoutType).toBe(LAYOUT_TYPE.MEDIA_ONLY);
  });

  it('SET_LAYOUT_INPUT replaces input, or applies an updater function', () => {
    const state = freshState();
    const replaced = dispatch(state, ACTIONS.SET_LAYOUT_INPUT, { custom: true });
    expect(replaced.input).toEqual({ custom: true });
    const updated = dispatch(state, ACTIONS.SET_LAYOUT_INPUT, (prev: LayoutState['input']) => ({ ...prev, marker: 1 }));
    expect(get(updated, 'input.marker')).toBe(1);
    expect(dispatch(state, ACTIONS.SET_LAYOUT_INPUT, state.input)).toBe(state);
  });

  it('SET_BROWSER_SIZE writes input.browser and ignores an equal size', () => {
    const state = dispatch(freshState(), ACTIONS.SET_BROWSER_SIZE, { width: 1366, height: 768 });
    expect(state.input.browser).toEqual({ width: 1366, height: 768 });
    expect(dispatch(state, ACTIONS.SET_BROWSER_SIZE, { width: 1366, height: 768 })).toBe(state);
  });

  it('SET_HIDE_NAVBAR_TOP_ROW is semantic state stored in the input', () => {
    const next = dispatch(freshState(), ACTIONS.SET_HIDE_NAVBAR_TOP_ROW, true);
    expect(next.input.navBar.hideTopRow).toBe(true);
  });

  it('SET_FULLSCREEN_ELEMENT writes element and group', () => {
    const value = { element: 'Presentation', group: 'presentation' };
    const next = dispatch(freshState(), ACTIONS.SET_FULLSCREEN_ELEMENT, value);
    expect(next.fullscreen).toEqual(value);
    expect(dispatch(next, ACTIONS.SET_FULLSCREEN_ELEMENT, { ...value })).toBe(next);
  });

  describe('camera dock', () => {
    it.each([
      [ACTIONS.SET_FOCUSED_CAMERA_ID, 'focusedId', 'stream-1'],
      [ACTIONS.SET_CAMERA_DOCK_IS_RESIZING, 'isResizing', true],
      [ACTIONS.SET_CAMERA_DOCK_POSITION, 'position', CAMERADOCK_POSITION.CONTENT_LEFT],
    ])('%s writes %s and marks the change local by default', (type, key, value) => {
      const next = dispatch(freshState(), type, value);
      expect(get(next, `input.cameraDock.${key}`)).toBe(value);
      expect(next.input.cameraDock.isLocalChange).toBe(true);
      const remote = dispatch(freshState(), type, value, { isLocalChange: false });
      expect(remote.input.cameraDock.isLocalChange).toBe(false);
    });

    it('SET_CAMERA_DOCK_SIZE writes the size, local by default', () => {
      const value = { width: 0, height: 240 };
      const next = dispatch(freshState(), ACTIONS.SET_CAMERA_DOCK_SIZE, value);
      expect(next.input.cameraDock).toMatchObject({ ...value, isLocalChange: true });
      expect(dispatch(next, ACTIONS.SET_CAMERA_DOCK_SIZE, { ...value })).toBe(next);
    });

    it('SET_CAMERA_DOCK_OPTIMAL_GRID_SIZE writes cameraOptimalGridSize', () => {
      const next = dispatch(freshState(), ACTIONS.SET_CAMERA_DOCK_OPTIMAL_GRID_SIZE, { width: 160, height: 120 });
      expect(next.input.cameraDock.cameraOptimalGridSize).toEqual({ width: 160, height: 120 });
    });
  });

  describe('sidebars', () => {
    it('SET_SIDEBAR_CONTENT_IS_OPEN(false) also closes the auxiliary panel', () => {
      const state = freshState();
      state.input.sidebarContentAuxiliary.isOpen = true;
      const next = dispatch(state, ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN, false);
      expect(next.input.sidebarContent.isOpen).toBe(false);
      expect(next.input.sidebarContentAuxiliary.isOpen).toBe(false);
    });

    it('SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN(true) opens the main panel and moves a sidebar dock to the top', () => {
      const state = freshState();
      state.input.sidebarContent.isOpen = false;
      state.input.cameraDock.position = CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM;
      const next = dispatch(state, ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN, true);
      expect(next.input.sidebarContentAuxiliary.isOpen).toBe(true);
      expect(next.input.sidebarContent.isOpen).toBe(true);
      expect(next.input.cameraDock.position).toBe(CAMERADOCK_POSITION.CONTENT_TOP);
    });

    it('SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN(true) clears an auxiliary panel equal to the main one', () => {
      const state = freshState();
      state.input.sidebarContent.sidebarContentPanel = PANELS.CHAT;
      state.input.sidebarContentAuxiliary.sidebarContentPanel = PANELS.CHAT;
      const next = dispatch(state, ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN, true);
      expect(next.input.sidebarContentAuxiliary.sidebarContentPanel).toBe(PANELS.NONE);
    });

    it('SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN falls back to the public chat id', () => {
      const next = dispatch(freshState(), ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_IS_OPEN, true);
      expect(next.idChatOpen).toBe(window.meetingClientSettings.public.chat.public_group_id);
    });

    it('SET_SIDEBAR_CONTENT_PANEL routes to the auxiliary panel while it is open', () => {
      const state = freshState();
      state.input.sidebarContentAuxiliary.isOpen = true;
      const next = dispatch(state, ACTIONS.SET_SIDEBAR_CONTENT_PANEL, PANELS.USERLIST);
      expect(next.input.sidebarContentAuxiliary.sidebarContentPanel).toBe(PANELS.USERLIST);
      expect(next.input.sidebarContent.sidebarContentPanel).toBe(state.input.sidebarContent.sidebarContentPanel);
    });

    it('SET_SIDEBAR_CONTENT_PANEL writes the main panel otherwise', () => {
      const next = dispatch(freshState(), ACTIONS.SET_SIDEBAR_CONTENT_PANEL, PANELS.USERLIST);
      expect(next.input.sidebarContent.sidebarContentPanel).toBe(PANELS.USERLIST);
    });

    it.each([
      [ACTIONS.SET_SIDEBAR_CONTENT_SIZE, 'sidebarContent'],
      [ACTIONS.SET_SIDEBAR_CONTENT_AUXILIARY_SIZE, 'sidebarContentAuxiliary'],
    ])('%s writes the user-chosen size', (type, key) => {
      const value = { width: 400, height: 707 };
      const next = dispatch(freshState(), type, value);
      expect(get(next, `input.${key}`)).toMatchObject(value);
      expect(dispatch(next, type, { ...value })).toBe(next);
    });
  });

  describe('presentation', () => {
    it('SET_PRESENTATION_IS_OPEN writes isOpen and flips the top pile item in place', () => {
      const state = freshState();
      const pile = state.presentationAreaContentActions;
      const next = dispatch(state, ACTIONS.SET_PRESENTATION_IS_OPEN, false);
      expect(next.input.presentation.isOpen).toBe(false);
      expect(next.presentationAreaContentActions).toBe(pile);
      expect(pile[pile.length - 1].value.open).toBe(false);
    });

    it('SET_PRESENTATION_CURRENT_SLIDE_SIZE writes the slide size', () => {
      const next = dispatch(freshState(), ACTIONS.SET_PRESENTATION_CURRENT_SLIDE_SIZE, { width: 1600, height: 900 });
      expect(next.input.presentation.currentSlide.size).toEqual({ width: 1600, height: 900 });
    });

    it('SET_PRESENTATION_CONTENT_UPDATED always stamps contentUpdatedAt', () => {
      const state = freshState();
      const next = dispatch(state, ACTIONS.SET_PRESENTATION_CONTENT_UPDATED, undefined);
      expect(next).not.toBe(state);
      expect(typeof next.input.presentation.contentUpdatedAt).toBe('number');
    });
  });

  describe('presentation area pile (mutated in place; plugin ui-data relies on it)', () => {
    const pileAction = (value: PileValue) => ({ type: ACTIONS.SET_PILE_CONTENT_FOR_PRESENTATION_AREA, value });

    it('pushes core content on top and keeps the same array', () => {
      const state = freshState();
      const pile = state.presentationAreaContentActions;
      const next = reduce(state, pileAction({ content: PRESENTATION_AREA.SCREEN_SHARE, open: true }));
      expect(next.presentationAreaContentActions).toBe(pile);
      expect(pile.map((p: PileItem) => p.value.content))
        .toEqual([PRESENTATION_AREA.WHITEBOARD_OPEN, PRESENTATION_AREA.SCREEN_SHARE]);
    });

    it('inserts plugin content under the core content on top', () => {
      let state = freshState();
      state = reduce(state, pileAction({ content: PRESENTATION_AREA.SCREEN_SHARE, open: true }));
      state = reduce(state, pileAction({
        content: PRESENTATION_AREA.GENERIC_CONTENT, open: true, genericContentId: 'p1',
      }));
      expect(state.presentationAreaContentActions.map((p: PileItem) => p.value.content)).toEqual([
        PRESENTATION_AREA.WHITEBOARD_OPEN, PRESENTATION_AREA.GENERIC_CONTENT, PRESENTATION_AREA.SCREEN_SHARE,
      ]);
    });

    it('removes every entry of a closed content', () => {
      let state = freshState();
      state = reduce(state, pileAction({ content: PRESENTATION_AREA.SCREEN_SHARE, open: true }));
      state = reduce(state, pileAction({ content: PRESENTATION_AREA.SCREEN_SHARE, open: false }));
      expect(state.presentationAreaContentActions.map((p: PileItem) => p.value.content))
        .toEqual([PRESENTATION_AREA.WHITEBOARD_OPEN]);
    });
  });
});
