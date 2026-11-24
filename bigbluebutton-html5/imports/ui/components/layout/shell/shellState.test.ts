import { describe, expect, it } from 'vitest';
import { shellState, ShellState } from './shellState';
import { CAMERADOCK_POSITION, DEVICE_TYPE, LAYOUT_TYPE } from '../enums';

const base: ShellState = {
  layoutType: LAYOUT_TYPE.UNIFIED_LAYOUT,
  layoutPending: false,
  deviceType: DEVICE_TYPE.DESKTOP,
  isRTL: false,
  hasBanner: false,
  hasNotification: false,
  hasNavBar: true,
  hideTopRow: false,
  hasActionBar: true,
  sidebarNavigationIsOpen: true,
  sidebarContentIsOpen: true,
  sidebarContentWidth: 0,
  sidebarContentAuxiliaryIsOpen: false,
  sidebarContentAuxiliaryWidth: 0,
  numCameras: 0,
  presentationIsOpen: true,
  presentationEnabled: true,
  slidesLength: 1,
  hasScreenShare: false,
  hasExternalVideo: false,
  genericContentId: '',
  notesPinned: false,
  dockPosition: CAMERADOCK_POSITION.CONTENT_TOP,
  isPhoneLandscape: false,
  fullscreenElement: '',
  fullscreenGroup: '',
  isDragging: false,
  isResizing: false,
  dockInputWidth: 0,
  dockInputHeight: 0,
  storedDockWidth: 0,
  storedDockHeight: 0,
  cameraGridWidth: 0,
  cameraGridHeight: 0,
  isPresenter: false,
};

const at = (o: Partial<ShellState>) => shellState({ ...base, ...o });

describe('shellState', () => {
  it('describes the default desktop unified layout', () => {
    expect(at({}).attributes).toEqual({
      'data-shell-layout': 'unified',
      'data-device': 'desktop',
      'data-navbar': 'full',
      'data-actionbar': 'shown',
      'data-banners': '0',
      'data-nav-open': '',
      'data-content-open': '',
      'data-presentation-open': '',
      'data-has-slides': '',
      'data-dock': 'contentTop',
      'data-dock-state': 'hidden',
      'data-media-box': 'none',
    });
    expect(at({}).style).toEqual({});
  });

  it('holds the layout type back while an enforced layout is loading (waitLayout)', () => {
    expect(at({ layoutPending: true }).attributes['data-shell-layout']).toBeUndefined();
  });

  it('flags phones, RTL, banners and the bar variants', () => {
    const { attributes } = at({
      deviceType: DEVICE_TYPE.MOBILE,
      isRTL: true,
      hasBanner: true,
      hasNotification: true,
      hideTopRow: true,
      hasActionBar: false,
    });
    expect(attributes).toMatchObject({
      'data-device': 'mobile',
      'data-mobile': '',
      'data-rtl': '',
      'data-banners': '2',
      'data-navbar': 'half',
      'data-actionbar': 'hidden',
    });
    expect(at({ hasNavBar: false, hideTopRow: true }).attributes['data-navbar']).toBe('hidden');
  });

  it('describes the camera dock: cameras, position, state, dragging, resizing, fullscreen', () => {
    const { attributes } = at({
      numCameras: 2, dockPosition: 'contentLeft', isDragging: true, isResizing: true,
    });
    expect(attributes).toMatchObject({
      'data-cameras': '',
      'data-dock': 'contentLeft',
      'data-dock-state': 'positioned',
      'data-dragging': '',
      'data-resizing': '',
    });
    expect(at({ numCameras: 1, fullscreenGroup: 'webcams' }).attributes['data-dock-state']).toBe('fullscreen');
    expect(at({ fullscreenElement: 'Presentation' }).attributes['data-fullscreen-media']).toBe('');
    expect(at({ isPresenter: true }).attributes['data-presenter']).toBe('');
    expect(at({ numCameras: 1, isPhoneLandscape: true }).attributes).toMatchObject({
      'data-dock': 'contentRight', 'data-dock-enforced': '', 'data-phone-landscape': '',
    });
  });

  it('flags slides and the absence of media content', () => {
    expect(at({ slidesLength: 0 }).attributes['data-has-slides']).toBeUndefined();
    expect(at({ slidesLength: 0 }).attributes['data-media-off']).toBe('');
  });

  it('carries the sizes the user chose as custom properties', () => {
    expect(at({
      sidebarContentWidth: 390,
      sidebarContentAuxiliaryIsOpen: true,
      sidebarContentAuxiliaryWidth: 400,
      numCameras: 1,
      storedDockHeight: 240,
      cameraGridWidth: 160,
      cameraGridHeight: 120,
    }).style).toEqual({
      '--bbb-sidebar-content-size': '390px',
      '--bbb-sidebar-aux-size': '400px',
      '--bbb-camera-dock-size': '240px',
      '--bbb-camera-grid-width': '160px',
      '--bbb-camera-grid-height': '120px',
    });
  });
});
