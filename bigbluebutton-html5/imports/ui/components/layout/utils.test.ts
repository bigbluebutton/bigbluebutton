import {
  afterEach, beforeEach, describe, expect, it,
} from 'vitest';
import {
  getDeviceType,
  getInitialSidebarContentPanel,
  getWaitLayout,
  isLayoutSupported,
  isValidSynchronizationLayout,
  LAYOUTS_SYNC,
  presentationContentHasChanges,
} from './utils';
import {
  DEVICE_TYPE, LAYOUT_ELEMENTS, LAYOUT_TYPE, PANELS, PRESENTATION_AREA, SYNC,
} from './enums';
import { setUserSettings } from '/imports/ui/core/local-states/useUserSettings';

// Characterization of the layout utilities as they behave on v4.0.x-develop.

const setClientWidth = (width: number) => {
  Object.defineProperty(document.documentElement, 'clientWidth', { configurable: true, value: width });
};

describe('layout utils', () => {
  afterEach(() => {
    setUserSettings({});
    // jsdom reports 0 by default
    setClientWidth(0);
  });

  describe('getDeviceType breakpoints (documentElement.clientWidth)', () => {
    it.each([
      [320, DEVICE_TYPE.MOBILE],
      [599, DEVICE_TYPE.MOBILE],
      [600, DEVICE_TYPE.TABLET_PORTRAIT],
      [899, DEVICE_TYPE.TABLET_PORTRAIT],
      [900, DEVICE_TYPE.TABLET_LANDSCAPE],
      [1199, DEVICE_TYPE.TABLET_LANDSCAPE],
      [1200, DEVICE_TYPE.DESKTOP],
      [1920, DEVICE_TYPE.DESKTOP],
    ])('%i px is %s', (width, expected) => {
      setClientWidth(width);
      expect(getDeviceType()).toBe(expected);
    });

    it('never answers the generic TABLET type', () => {
      const produced = new Set<string | null>();
      for (let width = 0; width <= 2000; width += 1) {
        setClientWidth(width);
        produced.add(getDeviceType());
      }
      expect(produced.has(DEVICE_TYPE.TABLET)).toBe(false);
      expect([...produced].sort()).toEqual([
        DEVICE_TYPE.DESKTOP, DEVICE_TYPE.MOBILE, DEVICE_TYPE.TABLET_LANDSCAPE, DEVICE_TYPE.TABLET_PORTRAIT,
      ].sort());
    });
  });

  describe('isLayoutSupported', () => {
    const visibleLayouts = [
      LAYOUT_TYPE.UNIFIED_LAYOUT,
      LAYOUT_TYPE.CAMERAS_ONLY,
      LAYOUT_TYPE.PRESENTATION_ONLY,
      LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
      LAYOUT_TYPE.MEDIA_ONLY,
    ];

    it.each(visibleLayouts)('supports %s on every produced device type', (layout) => {
      [DEVICE_TYPE.MOBILE, DEVICE_TYPE.TABLET_PORTRAIT, DEVICE_TYPE.TABLET_LANDSCAPE, DEVICE_TYPE.DESKTOP]
        .forEach((device) => expect(isLayoutSupported(device, layout)).toBe(true));
    });

    it('does not support PLUGINS_ONLY, so it falls back to unified', () => {
      expect(isLayoutSupported(DEVICE_TYPE.DESKTOP, LAYOUT_TYPE.PLUGINS_ONLY)).toBe(false);
    });

    it.each(['custom', 'smart', 'presentationFocus', 'videoFocus', 'UNIFIED_LAYOUT', 'unifeid'])(
      'does not support the legacy or unknown value %s',
      (layout) => expect(isLayoutSupported(DEVICE_TYPE.DESKTOP, layout)).toBe(false),
    );

    it('answers false for a missing layout or device', () => {
      expect(isLayoutSupported(null, LAYOUT_TYPE.UNIFIED_LAYOUT)).toBe(false);
      expect(isLayoutSupported(DEVICE_TYPE.DESKTOP, undefined)).toBe(false);
    });
  });

  describe('sync tables', () => {
    it('propagates only from unified', () => {
      const propagating = Object.entries(LAYOUTS_SYNC)
        .filter(([, sync]) => sync[SYNC.PROPAGATE_ELEMENTS].length > 0)
        .map(([layout]) => layout);
      expect(propagating).toEqual([LAYOUT_TYPE.UNIFIED_LAYOUT]);
    });

    it('propagates and replicates type, presentation, focus, dock position and dock size in unified', () => {
      const expected = [
        LAYOUT_ELEMENTS.LAYOUT_TYPE,
        LAYOUT_ELEMENTS.PRESENTATION_STATE,
        LAYOUT_ELEMENTS.FOCUSED_CAMERA,
        LAYOUT_ELEMENTS.CAMERA_DOCK_POSITION,
        LAYOUT_ELEMENTS.CAMERA_DOCK_SIZE,
      ];
      expect(LAYOUTS_SYNC[LAYOUT_TYPE.UNIFIED_LAYOUT][SYNC.PROPAGATE_ELEMENTS]).toEqual(expected);
      expect(LAYOUTS_SYNC[LAYOUT_TYPE.UNIFIED_LAYOUT][SYNC.REPLICATE_ELEMENTS]).toEqual(expected);
    });

    it('replicates per hidden layout', () => {
      expect(LAYOUTS_SYNC[LAYOUT_TYPE.CAMERAS_ONLY][SYNC.REPLICATE_ELEMENTS])
        .toEqual([LAYOUT_ELEMENTS.FOCUSED_CAMERA, LAYOUT_ELEMENTS.LAYOUT_TYPE]);
      expect(LAYOUTS_SYNC[LAYOUT_TYPE.MEDIA_ONLY][SYNC.REPLICATE_ELEMENTS]).toEqual([
        LAYOUT_ELEMENTS.FOCUSED_CAMERA, LAYOUT_ELEMENTS.PRESENTATION_STATE, LAYOUT_ELEMENTS.LAYOUT_TYPE,
      ]);
      [LAYOUT_TYPE.PRESENTATION_ONLY, LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY, LAYOUT_TYPE.PLUGINS_ONLY]
        .forEach((layout) => expect(LAYOUTS_SYNC[layout][SYNC.REPLICATE_ELEMENTS])
          .toEqual([LAYOUT_ELEMENTS.LAYOUT_TYPE]));
    });

    it('accepts every LAYOUT_TYPE value as a synchronization layout, and nothing else', () => {
      Object.values(LAYOUT_TYPE).forEach((layout) => expect(isValidSynchronizationLayout(layout)).toBe(true));
      expect(isValidSynchronizationLayout('smart')).toBe(false);
      expect(isValidSynchronizationLayout(undefined)).toBeFalsy();
    });
  });

  describe('presentationContentHasChanges', () => {
    const action = (content: string, genericContentId?: string) => ({ value: { content, genericContentId } });
    const pile = [action(PRESENTATION_AREA.WHITEBOARD_OPEN)];

    it('reports no change for the same contents and layout', () => {
      expect(presentationContentHasChanges(pile, [...pile], 'unified', 'unified')).toBe(false);
    });

    it('reports a change of the content list', () => {
      expect(presentationContentHasChanges(
        [...pile, action(PRESENTATION_AREA.SCREEN_SHARE)],
        pile,
        'unified',
        'unified',
      )).toBe(true);
    });

    it('reports a change of the layout type', () => {
      expect(presentationContentHasChanges(pile, pile, 'unified', 'mediaOnly')).toBe(true);
    });

    it('reports a change of the generic content id', () => {
      expect(presentationContentHasChanges(
        [action(PRESENTATION_AREA.GENERIC_CONTENT, 'a')],
        [action(PRESENTATION_AREA.GENERIC_CONTENT, 'b')],
        'unified',
        'unified',
      )).toBe(true);
    });
  });

  describe('getInitialSidebarContentPanel', () => {
    beforeEach(() => {
      const { public: pub } = window.meetingClientSettings;
      pub.layout.showParticipantsOnLogin = false;
      pub.chat.startClosed = false;
    });

    it('opens the chat by default when chat is enabled', () => {
      expect(getInitialSidebarContentPanel(true)).toBe(PANELS.CHAT);
    });

    it('opens nothing when chat is disabled and participants are not requested', () => {
      expect(getInitialSidebarContentPanel(false)).toBeNull();
    });

    it('prefers the user list when showParticipantsOnLogin is set', () => {
      window.meetingClientSettings.public.layout.showParticipantsOnLogin = true;
      expect(getInitialSidebarContentPanel(true)).toBe(PANELS.USERLIST);
    });

    it('honours chat.startClosed', () => {
      window.meetingClientSettings.public.chat.startClosed = true;
      expect(getInitialSidebarContentPanel(true)).toBeNull();
    });

    it('lets userdata override both settings', () => {
      setUserSettings({ bbb_show_participants_on_login: true });
      expect(getInitialSidebarContentPanel(true)).toBe(PANELS.USERLIST);
      setUserSettings({ bbb_show_public_chat_on_login: false });
      expect(getInitialSidebarContentPanel(true)).toBeNull();
    });

    it('opens nothing when bbb_hide_sidebar_navigation is set', () => {
      setUserSettings({ bbb_hide_sidebar_navigation: true, bbb_show_participants_on_login: true });
      expect(getInitialSidebarContentPanel(true)).toBeNull();
    });
  });

  describe('getWaitLayout', () => {
    it('reads the waitLayout query parameter', () => {
      window.history.replaceState(null, '', '/html5client/?sessionToken=x&waitLayout=1');
      expect(getWaitLayout()).toBe('1');
      window.history.replaceState(null, '', '/html5client/?sessionToken=x');
      expect(getWaitLayout()).toBe(false);
    });
  });
});
