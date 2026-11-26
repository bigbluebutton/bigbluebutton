import React from 'react';
import { act, render } from '@testing-library/react';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';

// A follower who set its own dock size keeps it when it joins (or reloads) a meeting whose presenter
// never resized: the meeting's size is 0, "not set". The size is stored per tab (sessionStorage).

const fake = vi.hoisted(() => ({
  meeting: undefined as undefined | { layout: Record<string, unknown> },
  dispatch: () => {},
}));

const loadedLayout = (setByUserId: string) => ({
  layout: {
    currentLayoutType: 'UNIFIED_LAYOUT',
    propagateLayout: true,
    cameraDockPlacement: 'contentTop',
    cameraDockSize: '0',
    cameraWithFocus: 'none',
    presentationMinimized: false,
    setByUserId,
    updatedAt: '1',
  },
});

const input = {
  cameraDock: { focusedId: 'none', position: 'contentTop', isResizing: false },
  browser: { width: 1280, height: 800 },
  presentation: { isOpen: true, contentUpdatedAt: 0 },
};

vi.mock('/imports/ui/core/hooks/useMeeting', () => ({ default: () => ({ data: fake.meeting }) }));
vi.mock('/imports/ui/core/hooks/useCurrentUser', () => ({
  default: () => ({ data: { presenter: false, isModerator: false, enforceLayout: null }, loading: false }),
}));
vi.mock('/imports/ui/components/layout/context', () => ({
  layoutDispatch: () => fake.dispatch,
  layoutSelectInput: (select: (i: unknown) => unknown) => select(input),
  layoutSelect: (select: (i: unknown) => unknown) => select({}),
}));
vi.mock('/imports/ui/components/layout/shell/context', () => ({ useShellState: () => ({}) }));
vi.mock('/imports/ui/components/layout/shell/selectors', () => ({ cameraDockPosition: () => 'contentTop' }));
vi.mock('/imports/ui/components/layout/push-layout/hooks', () => ({
  useMeetingLayoutUpdater: () => vi.fn(),
  usePushLayoutUpdater: () => vi.fn(),
  useLayoutUpdater: () => () => 'unified',
}));
vi.mock('/imports/ui/services/settings/hooks/useSettings', () => ({ default: () => ({ selectedLayout: 'unified' }) }));
vi.mock('/imports/ui/services/settings/hooks/useUserChangedLocalSettings', () => ({ default: () => vi.fn() }));
vi.mock('/imports/ui/services/settings', () => ({
  getSettingsSingletonInstance: () => ({ layout: { selectedLayout: 'unified' } }),
}));
vi.mock('/imports/ui/components/media/service', () => ({ default: { setPresentationIsOpen: vi.fn() } }));
vi.mock('/imports/ui/services/features', () => ({ useIsChatEnabled: () => true }));
vi.mock('/imports/ui/services/users-settings', () => ({ default: (_key: string, fallback: unknown) => fallback }));
vi.mock('/imports/utils/deviceInfo', () => ({ default: { isPhone: false } }));
vi.mock('/imports/ui/components/plugins-engine/ui-commands/layout/handler', () => ({ setEnforcedLayout: {} }));
vi.mock('@apollo/client', async (original) => ({
  ...(await original<object>()),
  useReactiveVar: () => ({ pluginEnforcedLayout: undefined }),
}));

const storedSize = () => JSON.parse(window.sessionStorage.getItem('BBB_cameraDockSize') ?? 'null');
const settle = () => act(async () => { await new Promise((resolve) => { setTimeout(resolve, 20); }); });

describe('push layout: a follower that joins', () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    // the follower's own earlier resize, kept in the tab across the reload
    window.sessionStorage.setItem('BBB_cameraDockSize', JSON.stringify({ width: 0, height: 0.5 }));
  });

  it('keeps its own size when the meeting layout is there from the first render', async () => {
    fake.meeting = loadedLayout('w_presenter');
    const { default: PushLayoutEngine } = await import('./pushLayoutEngine');
    render(<PushLayoutEngine />);
    await settle();
    expect(storedSize()).toEqual({ width: 0, height: 0.5 });
  });

  it('keeps its own size when the meeting layout arrives after the first render', async () => {
    fake.meeting = undefined;
    const { default: PushLayoutEngine } = await import('./pushLayoutEngine');
    const view = render(<PushLayoutEngine />);
    await settle();
    fake.meeting = loadedLayout('w_presenter');
    view.rerender(<PushLayoutEngine />);
    await settle();
    expect(storedSize()).toEqual({ width: 0, height: 0.5 });
  });
});
