import { describe, expect, it } from 'vitest';
import { reconcileLayoutInput } from './reconcile';
import {
  CASES, fixturePath, inputFor, serialize,
} from './reconcileCases';
import { INITIAL_INPUT_STATE } from './initState';

// The merge each layout manager's init() made, now a pure function: every characterized case
// (__fixtures__/reconcile, recorded on the old managers) must come out the same.

describe('reconcileLayoutInput', () => {
  it.each(CASES)('$name matches the old manager', async (c) => {
    const merged = reconcileLayoutInput(inputFor(c), {
      layoutType: c.layout,
      previousLayoutType: c.from,
      isMobile: c.deviceType === 'mobile',
      hasLoadedOnce: c.loadedOnce,
      hideSidebarNavigation: !!c.hideSidebarNavigation,
    });
    await expect(serialize(merged)).toMatchFileSnapshot(fixturePath(c));
  });

  it('starts from the initial input on the first load', () => {
    const merged = reconcileLayoutInput(inputFor(CASES[0]), {
      layoutType: 'unified',
      isMobile: false,
      hasLoadedOnce: false,
      hideSidebarNavigation: false,
    });
    expect(merged.navBar).toEqual(INITIAL_INPUT_STATE.navBar);
  });
});
