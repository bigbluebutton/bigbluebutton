import React from 'react';
import {
  beforeEach, describe, expect, it, vi,
} from 'vitest';
import { render, renderHook } from '@testing-library/react';
import { INITIAL_INPUT_STATE, INITIAL_OUTPUT_STATE } from '../initState';
import { LAYOUT_TYPE, DEVICE_TYPE } from '../enums';

// The layout state is a plain object here: layoutSelect / layoutSelectInput read from it.
const state = vi.hoisted(() => ({
  current: {} as Record<string, unknown>,
  presenter: false,
  waitLayout: false,
  hideControls: false,
  storedDock: undefined as undefined | { width: number; height: number },
}));

vi.mock('../context', () => ({
  layoutSelect: (selector: (s: unknown) => unknown) => selector(state.current),
  layoutSelectInput: (selector: (s: unknown) => unknown) => selector((state.current as { input: unknown }).input),
}));
vi.mock('../utils', () => ({
  getWaitLayout: () => state.waitLayout,
  isPhoneLandscape: () => false,
}));
vi.mock('/imports/ui/services/features', () => ({ useIsPresentationEnabled: () => true }));
vi.mock('/imports/ui/services/users-settings', () => ({ default: () => state.hideControls }));
vi.mock('/imports/ui/services/storage/hooks', () => ({
  useStorageKey: () => state.storedDock,
  STORAGES: { SESSION: 'session' },
}));
vi.mock('/imports/ui/core/hooks/useCurrentUser', () => ({
  default: () => ({ data: { presenter: state.presenter } }),
}));

// eslint-disable-next-line import/first
import useLayoutShell from './useLayoutShell';
// eslint-disable-next-line import/first
import { LayoutShellContext, useMediaBoxCollapse, useShellState } from './context';

const setLayout = (overrides: { input?: Record<string, unknown>; layout?: Record<string, unknown> } = {}) => {
  state.current = {
    layoutType: LAYOUT_TYPE.UNIFIED_LAYOUT,
    deviceType: DEVICE_TYPE.DESKTOP,
    isRTL: false,
    fullscreen: { element: '', group: '' },
    ...overrides.layout,
    input: { ...INITIAL_INPUT_STATE, ...overrides.input },
    output: INITIAL_OUTPUT_STATE,
  };
};

describe('useLayoutShell', () => {
  beforeEach(() => {
    state.presenter = false;
    state.waitLayout = false;
    state.hideControls = false;
    state.storedDock = undefined;
    setLayout();
  });

  it('describes the layout state as #layout attributes', () => {
    const { result } = renderHook(() => useLayoutShell());
    expect(result.current.attributes['data-shell-layout']).toBe(LAYOUT_TYPE.UNIFIED_LAYOUT);
    expect(result.current.attributes['data-device']).toBe(DEVICE_TYPE.DESKTOP);
    expect(result.current.attributes['data-navbar']).toBe('full');
    expect(result.current.state?.layoutType).toBe(LAYOUT_TYPE.UNIFIED_LAYOUT);
    expect(typeof result.current.mediaOnlyAreaRef).toBe('function');
  });

  it('holds the layout type back while an enforced layout loads, and halves the nav bar on request', () => {
    state.waitLayout = true;
    state.hideControls = true;
    setLayout({ layout: { layoutLoading: true } });
    const { result } = renderHook(() => useLayoutShell());
    expect(result.current.attributes['data-shell-layout']).toBeUndefined();
    expect(result.current.attributes['data-navbar']).toBe('half');
  });

  it('carries the stored dock size, the presenter and the mediaOnly content ratio', () => {
    state.presenter = true;
    state.storedDock = { width: 0, height: 180 };
    setLayout({
      layout: { layoutType: LAYOUT_TYPE.MEDIA_ONLY },
      input: {
        cameraDock: { ...INITIAL_INPUT_STATE.cameraDock, numCameras: 1, position: 'contentTop' },
        presentation: {
          ...INITIAL_INPUT_STATE.presentation,
          isOpen: true,
          slidesLength: 1,
          currentSlide: { num: 1, size: { width: 400, height: 300 } },
        },
      },
    });
    const { result } = renderHook(() => useLayoutShell());
    expect(result.current.attributes['data-presenter']).toBe('');
    // no area measured yet (the area box is not rendered here)
    expect(result.current.attributes['data-media-only-fit']).toBe('width');
    expect(result.current.style['--bbb-media-only-ratio']).toBe(String(400 / 300));
  });
});

describe('useLayoutShell with a sparse layout input', () => {
  it('reads absent optional parts of the input as empty', () => {
    setLayout({
      input: {
        externalVideo: undefined,
        cameraDock: { ...INITIAL_INPUT_STATE.cameraDock, cameraOptimalGridSize: undefined },
        presentation: { ...INITIAL_INPUT_STATE.presentation, currentSlide: undefined },
        screenShare: { hasScreenShare: true },
        genericMainContent: { genericContentId: undefined },
      },
    });
    const { result } = renderHook(() => useLayoutShell());
    expect(result.current.style['--bbb-camera-grid-width']).toBeUndefined();
    expect(result.current.attributes['data-media-off']).toBeUndefined();
  });
});

describe('shell context', () => {
  it('defaults to a media box with an area and no state outside the app', () => {
    expect(renderHook(() => useMediaBoxCollapse()).result.current).toBe('none');
    expect(renderHook(() => useShellState()).result.current).toBeUndefined();
  });

  it('hands the regions what #layout carries', () => {
    const Probe = () => <span data-collapse={useMediaBoxCollapse()} />;
    const { container } = render(
      <LayoutShellContext.Provider value={{ attributes: { 'data-media-box': 'zero' }, style: {} }}>
        <Probe />
      </LayoutShellContext.Provider>,
    );
    expect(container.querySelector('span')?.getAttribute('data-collapse')).toBe('zero');
  });
});
