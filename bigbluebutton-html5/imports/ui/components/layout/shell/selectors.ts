import { CAMERADOCK_POSITION, DEVICE_TYPE } from '../enums';

/**
 * The semantic decisions the layout engine made on every pass (unifiedLayout.jsx, layoutEngine.jsx), as
 * pure functions of the layout state. The CSS layout turns their answers into data attributes on
 * #layout; nothing here computes a size from the window.
 */
export interface ShellInputs {
  deviceType: string;
  isRTL: boolean;
  numCameras: number;
  presentationIsOpen: boolean;
  presentationEnabled: boolean;
  slidesLength: number;
  hasScreenShare: boolean;
  hasExternalVideo: boolean;
  genericContentId: string;
  notesPinned: boolean;
  /** the position the user chose (input), before the phone-landscape override */
  dockPosition: string;
  isPhoneLandscape: boolean;
  fullscreenGroup: string;
  isResizing: boolean;
  /** the live dock size while a resize is in progress */
  dockInputWidth: number;
  dockInputHeight: number;
  /** the stored dock size (sessionStorage BBB_webcamSize), 0 when never resized */
  storedDockWidth: number;
  storedDockHeight: number;
  sidebarContentIsOpen: boolean;
}

export type CameraDockState = 'hidden' | 'fill' | 'fullscreen' | 'positioned';

export interface Edges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

const isMobile = (s: ShellInputs) => s.deviceType === DEVICE_TYPE.MOBILE;

const hasPresentationSlides = (s: ShellInputs) => s.presentationEnabled && s.slidesLength !== 0;

/** No slides, external video, screen share, pinned notes or plugin content to show in the media area. */
export const isMediaContentOff = (s: ShellInputs) => !hasPresentationSlides(s)
  && !s.hasExternalVideo
  && !s.hasScreenShare
  && !s.notesPinned
  && !s.genericContentId;

/** A phone in landscape with cameras next to an open presentation: the dock is locked to the right. */
export const isSideBySideCamerasEnforced = (s: ShellInputs) => s.isPhoneLandscape
  && s.numCameras > 0
  && s.presentationIsOpen
  && !isMediaContentOff(s);

/** The position the dock is drawn at: the user's, or contentRight while locked side by side. */
export const effectiveCameraDockPosition = (s: ShellInputs) => (isSideBySideCamerasEnforced(s)
  ? CAMERADOCK_POSITION.CONTENT_RIGHT
  : s.dockPosition);

/** The engine's branch order in calculatesCameraDockBounds: hidden, then fill, then webcams fullscreen. */
export const cameraDockState = (s: ShellInputs): CameraDockState => {
  if (s.numCameras === 0 && hasPresentationSlides(s) && s.presentationIsOpen) return 'hidden';
  if (s.fullscreenGroup === 'webcams') return 'fullscreen';
  if (!s.presentationIsOpen || isMediaContentOff(s)) return 'fill';
  return 'positioned';
};

/** The media area has a box only while the presentation is open. */
const isMediaOpen = (s: ShellInputs) => s.presentationIsOpen;

export const isCameraDockDraggable = (s: ShellInputs) => !isMobile(s)
  && !isSideBySideCamerasEnforced(s)
  && isMediaOpen(s);

/** The dock edges that resize; from the raw position the user chose, mirrored in RTL. */
export const resizableCameraDockEdges = (s: ShellInputs): Edges => {
  const can = isMediaOpen(s) && !isSideBySideCamerasEnforced(s);
  const pos = s.dockPosition;
  return {
    top: can && (pos === CAMERADOCK_POSITION.CONTENT_BOTTOM
      || (pos === CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM && s.sidebarContentIsOpen)),
    right: can && ((!s.isRTL && pos === CAMERADOCK_POSITION.CONTENT_LEFT)
      || (s.isRTL && pos === CAMERADOCK_POSITION.CONTENT_RIGHT)),
    bottom: can && pos === CAMERADOCK_POSITION.CONTENT_TOP,
    left: can && ((!s.isRTL && pos === CAMERADOCK_POSITION.CONTENT_RIGHT)
      || (s.isRTL && pos === CAMERADOCK_POSITION.CONTENT_LEFT)),
  };
};

/**
 * The dock size the user chose along the dock's axis (px), or undefined when the CSS default applies:
 * the live size while resizing, otherwise the stored one. A top dock on a phone and a dock locked side by
 * side always use their default.
 */
export const cameraDockSizeVariable = (s: ShellInputs): number | undefined => {
  const position = effectiveCameraDockPosition(s);
  const horizontal = position === CAMERADOCK_POSITION.CONTENT_LEFT
    || position === CAMERADOCK_POSITION.CONTENT_RIGHT;
  if (isSideBySideCamerasEnforced(s)) return undefined;
  if (position === CAMERADOCK_POSITION.CONTENT_TOP && isMobile(s)) return undefined;
  const stored = horizontal ? s.storedDockWidth : s.storedDockHeight;
  if (stored === 0 && !s.isResizing) return undefined;
  if (s.isResizing) return horizontal ? s.dockInputWidth : s.dockInputHeight;
  return stored;
};
