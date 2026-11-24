import {
  afterEach, beforeEach, describe, expect, it,
} from 'vitest';
import {
  calculatePresentationVideoRate,
  equalDouble,
  getPropagatedCameraDock,
  hasCameraDockChanged,
  PushedCameraDock,
} from './service';
import { Input } from '../layoutTypes';

// Characterization of today's push-layout wire values: the rate is a share of the WINDOW,
// rounded to 2 decimals and clamped to [0, 1]. Old and new clients in one meeting must agree on it.

const setWindowSize = (width: number, height: number) => {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: width });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: height });
};

const dock = (overrides: Partial<PushedCameraDock>): PushedCameraDock => ({
  position: 'contentTop', width: 0, height: 0, ...overrides,
});

const dockInput = (overrides: Partial<Input['cameraDock']>) => ({
  isResizing: false, ...overrides,
}) as Input['cameraDock'];

describe('push-layout service', () => {
  let original: { width: number; height: number };

  beforeEach(() => {
    original = { width: window.innerWidth, height: window.innerHeight };
    setWindowSize(1366, 768);
  });

  afterEach(() => {
    setWindowSize(original.width, original.height);
  });

  describe('equalDouble', () => {
    it('treats values within 0.01 as equal', () => {
      expect(equalDouble(0.2, 0.21)).toBe(true);
      expect(equalDouble(0.5, 0.505)).toBe(true);
    });

    it('is float-sensitive at exactly 0.01 apart (0.2 - 0.19 = 0.010000000000000009)', () => {
      expect(equalDouble(0.2, 0.19)).toBe(false);
    });

    it('treats values more than 0.01 apart as different', () => {
      expect(equalDouble(0.2, 0.22)).toBe(false);
    });
  });

  describe('calculatePresentationVideoRate', () => {
    it.each(['contentTop', 'contentBottom', 'sidebarContentBottom'])(
      'uses the dock height over window.innerHeight for %s',
      (position) => {
        expect(calculatePresentationVideoRate(dock({ position, width: 982, height: 124 })))
          .toBe(0.16); // 124 / 768 = 0.1614...
      },
    );

    it.each(['contentLeft', 'contentRight'])(
      'uses the dock width over window.innerWidth for %s',
      (position) => {
        expect(calculatePresentationVideoRate(dock({ position, width: 196, height: 599 })))
          .toBe(0.14); // 196 / 1366 = 0.1434...
      },
    );

    it('rounds to two decimals', () => {
      expect(calculatePresentationVideoRate(dock({ height: 495 }))).toBe(0.64); // 0.6445
      expect(calculatePresentationVideoRate(dock({ height: 384 }))).toBe(0.5);
    });

    it('clamps to [0, 1]', () => {
      expect(calculatePresentationVideoRate(dock({ height: 2000 }))).toBe(1);
      expect(calculatePresentationVideoRate(dock({ height: -10 }))).toBe(0);
    });

    it('answers 0 for a non-finite rate', () => {
      setWindowSize(0, 0);
      expect(calculatePresentationVideoRate(dock({ height: 0 }))).toBe(0); // 0 / 0 = NaN
    });

    it('treats an unknown or empty position as vertical (height based)', () => {
      expect(calculatePresentationVideoRate(dock({ position: '', width: 683, height: 384 }))).toBe(0.5);
    });
  });

  describe('getPropagatedCameraDock', () => {
    const meetingCameraDock = { position: 'contentLeft', videoRate: 0.3 };

    it('sends the local dock while propagation is not suppressed', () => {
      expect(getPropagatedCameraDock({
        isSuppressed: false,
        cameraDock: dock({ position: 'contentRight', width: 273, height: 599 }),
        cameraDockInput: dockInput({ isResizing: true }),
        meetingCameraDock,
      })).toEqual({ isResizing: true, cameraPosition: 'contentRight', presentationVideoRate: 0.2 });
    });

    it('falls back to contentTop when the local dock has no position', () => {
      expect(getPropagatedCameraDock({
        isSuppressed: false,
        cameraDock: dock({ position: '', height: 154 }),
        cameraDockInput: dockInput({}),
        meetingCameraDock,
      }).cameraPosition).toBe('contentTop');
    });

    it('re-sends the meeting values, never resizing, while suppressed (phone landscape)', () => {
      expect(getPropagatedCameraDock({
        isSuppressed: true,
        cameraDock: dock({ position: 'contentRight', width: 190, height: 221 }),
        cameraDockInput: dockInput({ isResizing: true }),
        meetingCameraDock,
      })).toEqual({ isResizing: false, cameraPosition: 'contentLeft', presentationVideoRate: 0.3 });
    });

    it('sends an empty position while suppressed when the meeting has none', () => {
      expect(getPropagatedCameraDock({
        isSuppressed: true,
        cameraDock: dock({}),
        cameraDockInput: dockInput({}),
        meetingCameraDock: { videoRate: 0 },
      }).cameraPosition).toBe('');
    });
  });

  describe('hasCameraDockChanged', () => {
    const base = {
      isCameraDockPropagationSuppressed: false,
      cameraIsResizing: false,
      cameraPosition: 'contentTop',
      presentationVideoRate: 0.2,
    };

    it('never reports a change while suppressed', () => {
      expect(hasCameraDockChanged({ ...base, isCameraDockPropagationSuppressed: true }, {})).toBe(false);
    });

    it('reports a change when suppression is lifted', () => {
      expect(hasCameraDockChanged(base, { ...base, isCameraDockPropagationSuppressed: true })).toBe(true);
    });

    it('reports a change of the resizing flag or the position', () => {
      expect(hasCameraDockChanged(base, { ...base, cameraIsResizing: true })).toBe(true);
      expect(hasCameraDockChanged(base, { ...base, cameraPosition: 'contentLeft' })).toBe(true);
    });

    it('reports a change when there was no previous rate', () => {
      expect(hasCameraDockChanged(base, { ...base, presentationVideoRate: undefined })).toBe(true);
    });

    it('ignores rate changes of up to 0.01 and reports larger ones', () => {
      expect(hasCameraDockChanged(base, { ...base, presentationVideoRate: 0.21 })).toBe(false);
      expect(hasCameraDockChanged(base, { ...base, presentationVideoRate: 0.19 })).toBe(true); // float edge
      expect(hasCameraDockChanged(base, { ...base, presentationVideoRate: 0.22 })).toBe(true);
    });

    it('reports nothing when every field is equal', () => {
      expect(hasCameraDockChanged(base, { ...base })).toBe(false);
    });
  });
});
