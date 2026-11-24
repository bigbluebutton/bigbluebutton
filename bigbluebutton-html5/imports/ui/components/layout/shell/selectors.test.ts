import { describe, expect, it } from 'vitest';
import {
  cameraDockSizeVariable,
  cameraDockState,
  effectiveCameraDockPosition,
  isCameraDockDraggable,
  isMediaContentOff,
  isSideBySideCamerasEnforced,
  resizableCameraDockEdges,
  ShellInputs,
} from './selectors';
import { CAMERADOCK_POSITION, DEVICE_TYPE } from '../enums';

// The semantic decisions the layout engine made on each pass, as pure functions. Each case mirrors a
// branch of unifiedLayout.jsx / layoutEngine.jsx on v4.0.x-develop.

const base: ShellInputs = {
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
      expect(isCameraDockDraggable(at({ isPhoneLandscape: true }))).toBe(false);
      expect(isCameraDockDraggable(at({ presentationIsOpen: false }))).toBe(false);
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
