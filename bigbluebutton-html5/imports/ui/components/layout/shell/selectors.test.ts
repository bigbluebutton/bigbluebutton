import { describe, expect, it } from 'vitest';
import {
  cameraDockPosition,
  cameraDockSizeVariable,
  cameraDockState,
  effectiveCameraDockPosition,
  isCameraDockDraggable,
  isCameraDockShown,
  isUnifiedLayout,
  isMediaContentOff,
  isMediaBesideDock,
  isMediaFullscreen,
  isSideBySideCamerasEnforced,
  mediaBoxCollapse,
  resizableCameraDockEdges,
  ShellInputs,
} from './selectors';
import { CAMERADOCK_POSITION, DEVICE_TYPE, LAYOUT_TYPE } from '../enums';

// The semantic decisions the layout engine made on each pass, as pure functions. Each case mirrors a
// branch of unifiedLayout.jsx / layoutEngine.jsx on v4.0.x-develop.

const base: ShellInputs = {
  layoutType: LAYOUT_TYPE.UNIFIED_LAYOUT,
  deviceType: DEVICE_TYPE.DESKTOP,
  isRTL: false,
  numCameras: 1,
  presentationIsOpen: true,
  presentationEnabled: true,
  slidesLength: 1,
  hasScreenShare: false,
  hasExternalVideo: false,
  genericContentId: '',
  notesPinned: false,
  dockPosition: CAMERADOCK_POSITION.CONTENT_TOP,
  isPhoneLandscape: false,
  fullscreenGroup: '',
  isResizing: false,
  dockInputWidth: 0,
  dockInputHeight: 0,
  storedDockWidth: 0,
  storedDockHeight: 0,
  sidebarContentIsOpen: true,
  sidebarContentAuxiliaryIsOpen: false,
  fullscreenElement: '',
  isDragging: false,
  mediaOnlyFit: 'none',
};

const at = (overrides: Partial<ShellInputs>): ShellInputs => ({ ...base, ...overrides });

describe('layout shell selectors', () => {
  describe('isMediaContentOff', () => {
    it('is on while slides, external video, screen share, pinned notes or plugin content exist', () => {
      expect(isMediaContentOff(base)).toBe(false);
      const none = at({ slidesLength: 0 });
      expect(isMediaContentOff(none)).toBe(true);
      expect(isMediaContentOff({ ...none, hasScreenShare: true })).toBe(false);
      expect(isMediaContentOff({ ...none, hasExternalVideo: true })).toBe(false);
      expect(isMediaContentOff({ ...none, notesPinned: true })).toBe(false);
      expect(isMediaContentOff({ ...none, genericContentId: 'plugin' })).toBe(false);
    });

    it('ignores slides while the presentation feature is disabled', () => {
      expect(isMediaContentOff(at({ presentationEnabled: false }))).toBe(true);
    });
  });

  describe('phone-landscape side by side', () => {
    it('forces the dock to the right only with cameras, an open presentation and media', () => {
      expect(isSideBySideCamerasEnforced(at({ isPhoneLandscape: true }))).toBe(true);
      expect(isSideBySideCamerasEnforced(at({ isPhoneLandscape: true, numCameras: 0 }))).toBe(false);
      expect(isSideBySideCamerasEnforced(at({ isPhoneLandscape: true, presentationIsOpen: false }))).toBe(false);
      expect(isSideBySideCamerasEnforced(at({ isPhoneLandscape: true, slidesLength: 0 }))).toBe(false);
      expect(effectiveCameraDockPosition(at({ isPhoneLandscape: true, dockPosition: 'contentLeft' })))
        .toBe(CAMERADOCK_POSITION.CONTENT_RIGHT);
      expect(effectiveCameraDockPosition(at({ dockPosition: 'contentLeft' }))).toBe('contentLeft');
    });
  });

  describe('cameraDockState (the engine branch order)', () => {
    it('is hidden with no cameras over open slides', () => {
      expect(cameraDockState(at({ numCameras: 0 }))).toBe('hidden');
    });

    it('fills the media area when the presentation is closed or there is no media', () => {
      expect(cameraDockState(at({ presentationIsOpen: false }))).toBe('fill');
      expect(cameraDockState(at({ numCameras: 0, presentationIsOpen: false }))).toBe('fill');
      expect(cameraDockState(at({ slidesLength: 0 }))).toBe('fill');
    });

    it('covers the window in webcams fullscreen, over the fill case', () => {
      expect(cameraDockState(at({ fullscreenGroup: 'webcams' }))).toBe('fullscreen');
      expect(cameraDockState(at({ fullscreenGroup: 'webcams', presentationIsOpen: false }))).toBe('fullscreen');
      expect(cameraDockState(at({ fullscreenGroup: 'webcams', numCameras: 0 }))).toBe('hidden');
    });

    it('is positioned otherwise, even with no cameras when only other media is shown', () => {
      expect(cameraDockState(base)).toBe('positioned');
      expect(cameraDockState(at({ numCameras: 0, slidesLength: 0, hasScreenShare: true }))).toBe('positioned');
    });
  });

  describe('isCameraDockDraggable', () => {
    it('drags on desktop and tablets with the media open', () => {
      expect(isCameraDockDraggable(base)).toBe(true);
      expect(isCameraDockDraggable(at({ deviceType: DEVICE_TYPE.TABLET_PORTRAIT }))).toBe(true);
    });

    it('does not drag on phones, when locked side by side, or with the presentation closed', () => {
      expect(isCameraDockDraggable(at({ deviceType: DEVICE_TYPE.MOBILE }))).toBe(false);
      // the engine tests the plain tablet type only (layoutEngine.jsx isTablet)
      expect(isCameraDockDraggable(at({ deviceType: DEVICE_TYPE.TABLET }))).toBe(false);
      expect(isCameraDockDraggable(at({ fullscreenGroup: 'webcams' }))).toBe(false);
      expect(isCameraDockDraggable(at({ isPhoneLandscape: true }))).toBe(false);
      expect(isCameraDockDraggable(at({ presentationIsOpen: false }))).toBe(false);
    });
  });

  describe('layout types', () => {
    it('renders unknown types as unified', () => {
      expect(isUnifiedLayout(base)).toBe(true);
      expect(isUnifiedLayout(at({ layoutType: 'videoFocus' }))).toBe(true);
      expect(isUnifiedLayout(at({ layoutType: LAYOUT_TYPE.MEDIA_ONLY }))).toBe(false);
    });

    it('shows the dock per layout (the engine cameraDock.display)', () => {
      expect(isCameraDockShown(base)).toBe(true);
      expect(isCameraDockShown(at({ numCameras: 0 }))).toBe(false);
      expect(isCameraDockShown(at({ numCameras: 0, presentationIsOpen: false }))).toBe(true);
      expect(isCameraDockShown(at({ layoutType: LAYOUT_TYPE.CAMERAS_ONLY, numCameras: 0 }))).toBe(true);
      expect(isCameraDockShown(at({ layoutType: LAYOUT_TYPE.PRESENTATION_ONLY }))).toBe(false);
      expect(isCameraDockShown(at({ layoutType: LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY }))).toBe(false);
      expect(isCameraDockShown(at({ layoutType: LAYOUT_TYPE.MEDIA_ONLY }))).toBe(true);
      expect(isCameraDockShown(at({ layoutType: LAYOUT_TYPE.MEDIA_ONLY, numCameras: 0 }))).toBe(false);
    });

    it('reports the dock position per layout', () => {
      expect(cameraDockPosition(at({ isPhoneLandscape: true }))).toBe(CAMERADOCK_POSITION.CONTENT_RIGHT);
      expect(cameraDockPosition(at({ layoutType: LAYOUT_TYPE.CAMERAS_ONLY }))).toBeUndefined();
      expect(cameraDockPosition(at({ layoutType: LAYOUT_TYPE.PRESENTATION_ONLY })))
        .toBe(CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM);
      expect(cameraDockPosition(at({ layoutType: LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY })))
        .toBe(CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM);
    });

    it('reports the mediaOnly dock beside or above the content, and none without a positioned dock', () => {
      const mediaOnly = { layoutType: LAYOUT_TYPE.MEDIA_ONLY };
      expect(cameraDockPosition(at({ ...mediaOnly, mediaOnlyFit: 'height' }))).toBe(CAMERADOCK_POSITION.CONTENT_LEFT);
      expect(cameraDockPosition(at({ ...mediaOnly, mediaOnlyFit: 'width' }))).toBe(CAMERADOCK_POSITION.CONTENT_TOP);
      expect(cameraDockPosition(at({ ...mediaOnly, presentationIsOpen: false }))).toBeUndefined();
      expect(cameraDockPosition(at({ ...mediaOnly, numCameras: 0 }))).toBeUndefined();
    });

    it('gives no dock box to layouts without cameras or without a dock', () => {
      expect(cameraDockState(at({ layoutType: LAYOUT_TYPE.CAMERAS_ONLY, numCameras: 0, presentationIsOpen: false })))
        .toBe('hidden');
      expect(cameraDockState(at({ layoutType: LAYOUT_TYPE.CAMERAS_ONLY, presentationIsOpen: false }))).toBe('fill');
      expect(cameraDockState(at({ layoutType: LAYOUT_TYPE.PRESENTATION_ONLY }))).toBe('hidden');
      expect(cameraDockState(at({ layoutType: LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY }))).toBe('hidden');
    });

    it('drags and resizes the dock in unified only', () => {
      const cameras = at({ layoutType: LAYOUT_TYPE.CAMERAS_ONLY, dockPosition: CAMERADOCK_POSITION.CONTENT_BOTTOM });
      expect(isCameraDockDraggable(cameras)).toBe(false);
      expect(resizableCameraDockEdges(cameras).top).toBe(false);
    });
  });

  describe('mediaBoxCollapse (calculatesMediaBounds reduced to whether it has an area)', () => {
    it('has a box in unified with the presentation open, and in fullscreen', () => {
      expect(mediaBoxCollapse(base)).toBe('none');
      expect(mediaBoxCollapse(at({ layoutType: 'someTypo' }))).toBe('none');
      expect(mediaBoxCollapse(at({ fullscreenElement: 'Screenshare', fullscreenGroup: 'webcams' }))).toBe('none');
    });

    it('is empty with the presentation closed or a sidebar open on a phone', () => {
      expect(mediaBoxCollapse(at({ presentationIsOpen: false }))).toBe('zero');
      expect(mediaBoxCollapse(at({ deviceType: DEVICE_TYPE.MOBILE }))).toBe('zero');
      expect(mediaBoxCollapse(at({
        deviceType: DEVICE_TYPE.MOBILE, sidebarContentIsOpen: false,
      }))).toBe('none');
      expect(mediaBoxCollapse(at({
        deviceType: DEVICE_TYPE.MOBILE, sidebarContentIsOpen: false, sidebarContentAuxiliaryIsOpen: true,
      }))).toBe('zero');
    });

    it('is squeezed out by a dock that fills the window or the area', () => {
      const webcams = { fullscreenGroup: 'webcams' };
      expect(mediaBoxCollapse(at(webcams))).toBe('negative');
      expect(mediaBoxCollapse(at({ ...webcams, dockPosition: CAMERADOCK_POSITION.CONTENT_BOTTOM }))).toBe('negative');
      expect(mediaBoxCollapse(at({ ...webcams, dockPosition: CAMERADOCK_POSITION.CONTENT_LEFT }))).toBe('zero');
      expect(mediaBoxCollapse(at({ ...webcams, dockPosition: CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM }))).toBe('none');
      expect(mediaBoxCollapse(at({ ...webcams, isDragging: true }))).toBe('none');
      expect(mediaBoxCollapse(at({
        ...webcams, numCameras: 0, slidesLength: 0, hasScreenShare: true,
      }))).toBe('none');
      const noMedia = { slidesLength: 0 };
      expect(mediaBoxCollapse(at({ ...noMedia, dockPosition: CAMERADOCK_POSITION.CONTENT_RIGHT }))).toBe('zero');
      expect(mediaBoxCollapse(at(noMedia))).toBe('negative');
    });

    it('follows each special layout', () => {
      expect(mediaBoxCollapse(at({ layoutType: LAYOUT_TYPE.CAMERAS_ONLY }))).toBe('zero');
      expect(mediaBoxCollapse(at({ layoutType: LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY }))).toBe('zero');
      expect(mediaBoxCollapse(at({ layoutType: LAYOUT_TYPE.PRESENTATION_ONLY }))).toBe('none');
      expect(mediaBoxCollapse(at({
        layoutType: LAYOUT_TYPE.PRESENTATION_ONLY, presentationIsOpen: false,
      }))).toBe('zero');
      expect(mediaBoxCollapse(at({ layoutType: LAYOUT_TYPE.MEDIA_ONLY }))).toBe('none');
      expect(mediaBoxCollapse(at({ layoutType: LAYOUT_TYPE.MEDIA_ONLY, slidesLength: 0 }))).toBe('zero');
    });

    it('makes room for the dock with cameras, unless dragging, in fullscreen or presentationOnly', () => {
      expect(isMediaBesideDock(base)).toBe(true);
      expect(isMediaBesideDock(at({ numCameras: 0 }))).toBe(false);
      expect(isMediaBesideDock(at({ isDragging: true }))).toBe(false);
      expect(isMediaBesideDock(at({ fullscreenElement: 'Presentation' }))).toBe(false);
      expect(isMediaBesideDock(at({ layoutType: LAYOUT_TYPE.PRESENTATION_ONLY }))).toBe(false);
    });

    it('knows the media regions that go fullscreen', () => {
      expect(isMediaFullscreen(at({ fullscreenElement: 'GenericContent' }))).toBe(true);
      expect(isMediaFullscreen(at({ fullscreenElement: 'webcams' }))).toBe(false);
    });
  });

  describe('resizableCameraDockEdges (raw input position, mirrored in RTL)', () => {
    it.each([
      ['contentTop', false, { bottom: true }],
      ['contentBottom', false, { top: true }],
      ['contentLeft', false, { right: true }],
      ['contentRight', false, { left: true }],
      ['contentLeft', true, { left: true }],
      ['contentRight', true, { right: true }],
      ['sidebarContentBottom', false, { top: true }],
    ])('%s (RTL %s)', (dockPosition, isRTL, edges) => {
      expect(resizableCameraDockEdges(at({ dockPosition, isRTL }))).toEqual({
        top: false, right: false, bottom: false, left: false, ...edges,
      });
    });

    it('has no edges at the sidebar while the sidebar is closed, when locked, or with no media', () => {
      const none = {
        top: false, right: false, bottom: false, left: false,
      };
      expect(resizableCameraDockEdges(at({ dockPosition: 'sidebarContentBottom', sidebarContentIsOpen: false })))
        .toEqual(none);
      expect(resizableCameraDockEdges(at({ isPhoneLandscape: true }))).toEqual(none);
      expect(resizableCameraDockEdges(at({ presentationIsOpen: false }))).toEqual(none);
    });
  });

  describe('cameraDockSizeVariable (the size the user chose, or none for the default)', () => {
    it('is none before any resize', () => {
      expect(cameraDockSizeVariable(base)).toBeUndefined();
    });

    it('is the live size while resizing and the stored size afterwards, along the dock axis', () => {
      expect(cameraDockSizeVariable(at({ isResizing: true, dockInputHeight: 244, dockInputWidth: 982 }))).toBe(244);
      expect(cameraDockSizeVariable(at({ storedDockHeight: 240 }))).toBe(240);
      expect(cameraDockSizeVariable(at({ dockPosition: 'contentRight', storedDockWidth: 302.7 }))).toBe(302.7);
      expect(cameraDockSizeVariable(at({ dockPosition: 'sidebarContentBottom', storedDockHeight: 240 }))).toBe(240);
    });

    it('keeps the default for a top dock on a phone, and the 25% rule when locked side by side', () => {
      expect(cameraDockSizeVariable(at({ deviceType: DEVICE_TYPE.MOBILE, storedDockHeight: 240 }))).toBeUndefined();
      expect(cameraDockSizeVariable(at({
        deviceType: DEVICE_TYPE.MOBILE, dockPosition: 'contentBottom', storedDockHeight: 240,
      }))).toBe(240);
      expect(cameraDockSizeVariable(at({ isPhoneLandscape: true, storedDockWidth: 300 }))).toBeUndefined();
    });
  });
});
