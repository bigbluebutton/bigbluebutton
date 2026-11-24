import React from 'react';
import {
  afterEach, describe, expect, it, vi,
} from 'vitest';
import { act, render } from '@testing-library/react';
import { INITIAL_INPUT_STATE, INITIAL_OUTPUT_STATE } from './initState';
import { ACTIONS } from './enums';
import {
  CASES, fixturePath, inputFor, serialize,
} from './reconcileCases';
import Session from '/imports/ui/services/storage/in-memory';

// Characterization of the layout managers' init() merge (layout-manager/*.jsx), recorded as fixtures
// before the managers are removed: the engine is rendered with a fake layout state, and the
// SET_LAYOUT_INPUT updater it dispatches is applied to a known previous input.

const fake = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  updaters: [] as ((prev: unknown) => unknown)[],
  hideSidebarNavigation: false,
}));

vi.mock('/imports/ui/components/layout/context', () => ({
  layoutSelect: (selector: (s: unknown) => unknown) => selector(fake.state),
  layoutSelectInput: (selector: (s: unknown) => unknown) => selector((fake.state as { input: unknown }).input),
  layoutSelectOutput: (selector: (s: unknown) => unknown) => selector((fake.state as { output: unknown }).output),
  layoutDispatch: () => (action: { type: string; value: unknown }) => {
    if (action.type === ACTIONS.SET_LAYOUT_INPUT && typeof action.value === 'function') {
      fake.updaters.push(action.value as (prev: unknown) => unknown);
    }
  },
}));
vi.mock('/imports/ui/services/features', () => ({ useIsPresentationEnabled: () => true }));
vi.mock('/imports/ui/services/users-settings', () => ({
  default: (key: string, fallback: unknown) => (key === 'bbb_hide_sidebar_navigation'
    ? fake.hideSidebarNavigation : fallback),
}));

// eslint-disable-next-line import/first
import LayoutEngine from './layout-manager/layoutEngine';

const setState = (layoutType: string, deviceType: string) => {
  fake.state = {
    layoutType,
    deviceType,
    isRTL: false,
    fontSize: 16,
    layoutLoading: false,
    fullscreen: { element: '', group: '' },
    input: INITIAL_INPUT_STATE,
    output: INITIAL_OUTPUT_STATE,
  };
};

describe('layout managers init() (characterization, recorded as fixtures)', () => {
  afterEach(() => {
    fake.updaters = [];
    fake.hideSidebarNavigation = false;
    Session.removeItem('hasLayoutEngineLoadedOnce');
  });

  it.each(CASES)('$name', async (c) => {
    fake.hideSidebarNavigation = !!c.hideSidebarNavigation;
    if (c.loadedOnce) Session.setItem('hasLayoutEngineLoadedOnce', true);
    else Session.removeItem('hasLayoutEngineLoadedOnce');
    setState(c.from ?? c.layout, c.deviceFrom ?? c.deviceType);
    const view = render(<LayoutEngine />);
    if (c.from || c.deviceFrom) {
      setState(c.layout, c.deviceType);
      act(() => view.rerender(<LayoutEngine />));
    }
    const update = fake.updaters[fake.updaters.length - 1];
    expect(update).toBeTypeOf('function');
    const merged = update(inputFor(c)) as object;
    view.unmount();
    await expect(serialize(merged)).toMatchFileSnapshot(fixturePath(c));
  });
});
