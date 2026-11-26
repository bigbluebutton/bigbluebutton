import { describe, expect, it } from 'vitest';
import isSidebarAtMinWidth from './isAtMinWidth';
import { DEVICE_TYPE } from '/imports/ui/components/layout/enums';

// Same answers as the old check on the engine's numbers: width <= minWidth + 1, where minWidth was
// 283.2 px, or the whole window (equal to the width) on a phone-sized layout.
describe('isSidebarAtMinWidth', () => {
  it('is false while the sidebar has no size', () => {
    expect(isSidebarAtMinWidth(0, DEVICE_TYPE.DESKTOP)).toBe(false);
    expect(isSidebarAtMinWidth(0, DEVICE_TYPE.MOBILE)).toBe(false);
  });

  it('is true up to the minimum plus 1 px', () => {
    expect(isSidebarAtMinWidth(283.1875, DEVICE_TYPE.DESKTOP)).toBe(true);
    expect(isSidebarAtMinWidth(284.2, DEVICE_TYPE.TABLET_LANDSCAPE)).toBe(true);
    expect(isSidebarAtMinWidth(284.3, DEVICE_TYPE.DESKTOP)).toBe(false);
    expect(isSidebarAtMinWidth(390, DEVICE_TYPE.DESKTOP)).toBe(false);
  });

  it('is always true on a phone-sized layout, where the sidebar takes the whole window', () => {
    expect(isSidebarAtMinWidth(500, DEVICE_TYPE.MOBILE)).toBe(true);
  });
});
