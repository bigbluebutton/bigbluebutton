import {
  afterEach, beforeEach, describe, expect, it,
} from 'vitest';
import {
  applyMeetingDockSize,
  DOCK_SIZE_STORAGE_KEY,
  dockAxis,
  fractionFor,
  fractionOf,
  fractionOfBox,
  readStoredDockSize,
  withFraction,
} from './dockSize';
import Storage from '/imports/ui/services/storage/session';

// The dock size the user chose is a fraction (0-1) of the area the dock sits in, along its axis: the
// media area's height for a top or bottom dock, its width for a side dock, the sidebar column's height
// for a dock below the sidebar. 0 means not set (the CSS default).

describe('dock size as a fraction of its area', () => {
  it('measures along the dock axis', () => {
    expect(dockAxis('contentTop')).toBe('height');
    expect(dockAxis('contentBottom')).toBe('height');
    expect(dockAxis('sidebarContentBottom')).toBe('height');
    expect(dockAxis('contentLeft')).toBe('width');
    expect(dockAxis('contentRight')).toBe('width');
    expect(dockAxis(undefined)).toBe('height');
  });

  it('is the rendered size over the area size, within [0, 1], to 4 decimals', () => {
    expect(fractionOf(150, 600)).toBe(0.25);
    expect(fractionOf(200, 600)).toBe(0.3333);
    expect(fractionOf(900, 600)).toBe(1);
    expect(fractionOf(-5, 600)).toBe(0);
    expect(fractionOf(100, 0)).toBe(0);
    expect(fractionOf(Number.NaN, 600)).toBe(0);
  });

  it('takes the rendered dock box over its area box, along the dock axis', () => {
    const area = { width: 1000, height: 600 };
    expect(fractionOfBox('contentTop', { width: 1000, height: 150 }, area)).toBe(0.25);
    expect(fractionOfBox('contentLeft', { width: 300, height: 580 }, area)).toBe(0.3);
    expect(fractionOfBox('sidebarContentBottom', { width: 280, height: 120 }, { width: 280, height: 700 }))
      .toBe(0.1714);
  });

  it('keeps one fraction per axis, read for the position', () => {
    const stored = withFraction({ width: 0, height: 0 }, 'contentTop', 0.3);
    expect(stored).toEqual({ width: 0, height: 0.3 });
    const both = withFraction(stored, 'contentRight', 0.25);
    expect(both).toEqual({ width: 0.25, height: 0.3 });
    expect(fractionFor(both, 'contentLeft')).toBe(0.25);
    expect(fractionFor(both, 'sidebarContentBottom')).toBe(0.3);
  });

  it('reads only well-formed fractions; anything else is not set', () => {
    expect(readStoredDockSize({ width: 0.2, height: 0.4 })).toEqual({ width: 0.2, height: 0.4 });
    expect(readStoredDockSize(undefined)).toEqual({ width: 0, height: 0 });
    expect(readStoredDockSize({ width: 320, height: 180 })).toEqual({ width: 0, height: 0 });
    expect(readStoredDockSize({ width: '0.2', height: null })).toEqual({ width: 0, height: 0 });
    expect(readStoredDockSize('0.2')).toEqual({ width: 0, height: 0 });
  });

  describe('persistence', () => {
    beforeEach(() => {
      Storage.removeItem(DOCK_SIZE_STORAGE_KEY);
      Storage.removeItem('webcamSize');
    });
    afterEach(() => {
      Storage.removeItem(DOCK_SIZE_STORAGE_KEY);
      Storage.removeItem('webcamSize');
    });

    it('takes the meeting size for the axis of the meeting position, keeping the other axis', () => {
      Storage.setItem(DOCK_SIZE_STORAGE_KEY, { width: 0.2, height: 0.3 });
      applyMeetingDockSize('contentTop', 0.45);
      expect(Storage.getItem(DOCK_SIZE_STORAGE_KEY)).toEqual({ width: 0.2, height: 0.45 });
      applyMeetingDockSize('contentLeft', 0);
      expect(Storage.getItem(DOCK_SIZE_STORAGE_KEY)).toEqual({ width: 0, height: 0.45 });
      // no position from the meeting: the default one (contentTop)
      applyMeetingDockSize('', 0.25);
      expect(Storage.getItem(DOCK_SIZE_STORAGE_KEY)).toEqual({ width: 0, height: 0.25 });
    });

    it('stores under a new key and ignores the old pixel one', () => {
      expect(DOCK_SIZE_STORAGE_KEY).toBe('cameraDockSize');
      Storage.setItem('webcamSize', { width: 320, height: 180 });
      expect(readStoredDockSize(Storage.getItem(DOCK_SIZE_STORAGE_KEY))).toEqual({ width: 0, height: 0 });
      expect(window.sessionStorage.getItem('BBB_cameraDockSize')).toBeNull();
    });
  });
});
