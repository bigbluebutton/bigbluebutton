import React from 'react';
import {
  afterEach, beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render } from '@testing-library/react';
import { INITIAL_INPUT_STATE } from './initState';
import {
  ACTIONS, DEVICE_TYPE, LAYOUT_TYPE, PANELS,
} from './enums';
import Session from '/imports/ui/services/storage/in-memory';
import { LayoutShellContext } from './shell/context';
import type { ShellOutput, ShellState } from './shell/shellState';
import { reconcileLayoutInput } from './reconcile';
import type { Input } from './layoutTypes';

// The layout engine's jobs besides geometry: the input reconciliation (reconcile.ts) when a layout is
// first rendered or the device type changes, layoutReady and hasLayoutEngineLoadedOnce, and the sidebars
// camerasOnly and presentationOnly keep closed.

const fake = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  actions: [] as { type: string; value: unknown }[],
  waitLayout: false,
}));

vi.mock('./context', () => ({
  layoutSelect: (selector: (s: unknown) => unknown) => selector(fake.state),
  layoutSelectInput: (selector: (s: unknown) => unknown) => selector((fake.state as { input: unknown }).input),
  layoutDispatch: () => (action: { type: string; value: unknown }) => fake.actions.push(action),
}));
vi.mock('./utils', async (original) => ({
  ...(await original<typeof import('./utils')>()),
  getWaitLayout: () => fake.waitLayout,
}));
vi.mock('/imports/ui/services/users-settings', () => ({ default: (_key: string, fallback: unknown) => fallback }));

// eslint-disable-next-line import/first
import LayoutLifecycle from './LayoutLifecycle';

const setState = (overrides: Record<string, unknown> = {}, input: Record<string, unknown> = {}) => {
  fake.state = {
    layoutType: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceType: DEVICE_TYPE.DESKTOP,
    layoutLoading: false,
    ...overrides,
    input: { ...INITIAL_INPUT_STATE, ...input },
  };
};

const shellWith = (state: Partial<ShellState>): ShellOutput => ({
  attributes: {}, style: {}, state: state as ShellState,
});

const renderLifecycle = (shell: ShellOutput = shellWith({})) => {
  const view = render(
    <LayoutShellContext.Provider value={shell}><LayoutLifecycle /></LayoutShellContext.Provider>,
  );
  return {
    ...view,
    update: (next: ShellOutput = shell) => view.rerender(
      <LayoutShellContext.Provider value={next}><LayoutLifecycle /></LayoutShellContext.Provider>,
    ),
  };
};

const inits = () => fake.actions.filter((a) => a.type === ACTIONS.SET_LAYOUT_INPUT);
const applyLastInit = () => (inits().at(-1)!.value as (prev: unknown) => unknown)(INITIAL_INPUT_STATE);

describe('LayoutLifecycle', () => {
  beforeEach(() => {
    fake.actions = [];
    fake.waitLayout = false;
    Session.removeItem('hasLayoutEngineLoadedOnce');
    Session.removeItem('layoutReady');
    setState();
  });
  afterEach(() => vi.restoreAllMocks());

  it('reconciles the input on the first render from the initial input, then marks the layout ready', () => {
    renderLifecycle();
    expect(inits()).toHaveLength(1);
    expect(applyLastInit()).toEqual(reconcileLayoutInput(INITIAL_INPUT_STATE as unknown as Input, {
      layoutType: LAYOUT_TYPE.UNIFIED_LAYOUT, isMobile: false, hasLoadedOnce: false, hideSidebarNavigation: false,
    }));
    expect(Session.getItem('layoutReady')).toBe(true);
    expect(Session.getItem('hasLayoutEngineLoadedOnce')).toBe(true);
  });

  it('waits for an enforced layout, but counts as loaded once from the start', () => {
    fake.waitLayout = true;
    setState({ layoutLoading: true });
    const { update } = renderLifecycle();
    expect(inits()).toHaveLength(0);
    expect(Session.getItem('hasLayoutEngineLoadedOnce')).toBe(true);
    setState({ layoutType: LAYOUT_TYPE.CAMERAS_ONLY, layoutLoading: false });
    update();
    expect(inits()).toHaveLength(1);
    expect((applyLastInit() as typeof INITIAL_INPUT_STATE).sidebarNavigation.isOpen).toBe(false);
  });

  it('reconciles again on a layout switch, with the previous layout, and on a device type change', () => {
    const { update } = renderLifecycle();
    setState({ layoutType: LAYOUT_TYPE.CAMERAS_ONLY });
    update();
    setState({ layoutType: LAYOUT_TYPE.UNIFIED_LAYOUT });
    update();
    expect(inits()).toHaveLength(3);
    // back from camerasOnly: the navigation and the chat open again
    const closed = {
      ...INITIAL_INPUT_STATE,
      sidebarContent: { ...INITIAL_INPUT_STATE.sidebarContent, isOpen: false, sidebarContentPanel: PANELS.NONE },
    };
    const reopened = (inits()[2].value as (p: unknown) => typeof INITIAL_INPUT_STATE)(closed);
    expect(reopened.sidebarContent.sidebarContentPanel).toBe(PANELS.CHAT);
    setState({ deviceType: DEVICE_TYPE.MOBILE });
    update();
    expect(inits()).toHaveLength(4);
  });

  it('does not reconcile between two types that both render as unified, nor without a device type', () => {
    const { update } = renderLifecycle();
    setState({ layoutType: 'videoFocus' });
    update();
    expect(inits()).toHaveLength(1);
    fake.actions = [];
    setState({ deviceType: null });
    const other = renderLifecycle();
    expect(inits()).toHaveLength(0);
    other.unmount();
  });

  it('keeps the sidebars closed in camerasOnly and presentationOnly', () => {
    setState({ layoutType: LAYOUT_TYPE.PRESENTATION_ONLY }, {
      sidebarNavigation: { ...INITIAL_INPUT_STATE.sidebarNavigation, isOpen: false },
    });
    const { update } = renderLifecycle();
    fake.actions = [];
    setState({ layoutType: LAYOUT_TYPE.PRESENTATION_ONLY }, {
      sidebarNavigation: { ...INITIAL_INPUT_STATE.sidebarNavigation, isOpen: true },
    });
    update();
    expect(fake.actions.map((a) => [a.type, a.value])).toEqual([
      [ACTIONS.SET_SIDEBAR_NAVIGATION_IS_OPEN, false],
      [ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN, false],
      [ACTIONS.SET_SIDEBAR_CONTENT_PANEL, PANELS.NONE],
    ]);
  });
});
