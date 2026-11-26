import { CAMERADOCK_POSITION, DEVICE_TYPE, LAYOUT_TYPE } from '../enums';

/**
 * The semantic decisions the layout engine made on every pass (unifiedLayout.jsx, layoutEngine.jsx), as
 * pure functions of the layout state. The CSS layout turns their answers into data attributes on
 * #layout; nothing here computes a size from the window.
 */
export interface ShellInputs {
  /** the layout the client renders (LAYOUT_TYPE); anything unknown renders as unified */
  layoutType: string;
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
  /**
   * the dock size the user stored (sessionStorage BBB_cameraDockSize), as fractions (0-1) of the dock's
   * area along each axis; 0 = not set
   */
  storedDockWidth: number;
  storedDockHeight: number;
  sidebarContentIsOpen: boolean;
  sidebarContentAuxiliaryIsOpen: boolean;
  /** the element in fullscreen (Presentation, Screenshare, ExternalVideo, GenericContent, ...) */
  fullscreenElement: string;
  /** the camera dock is being dragged */
  isDragging: boolean;
  /**
   * mediaOnly with cameras: how the content fits its area (useMediaOnlyFit): limited by the area's
   * height (cameras on its left), by its width (cameras on top), or no content size ('none').
   */
  mediaOnlyFit: MediaOnlyFit;
}

export type MediaOnlyFit = 'height' | 'width' | 'none';

export type CameraDockState = 'hidden' | 'fill' | 'fullscreen' | 'positioned';

/**
 * How the engine's media box (calculatesMediaBounds) ends up: a real box, a zero width or height (the
 * presentation unmounts, the other regions hide), or a negative height (the browser drops the value and
 * the region keeps the height it had).
 */
export type MediaBoxCollapse = 'none' | 'zero' | 'negative';

export interface Edges {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
}

const isMobile = (s: ShellInputs) => s.deviceType === DEVICE_TYPE.MOBILE;

const SPECIAL_LAYOUTS = [
  LAYOUT_TYPE.CAMERAS_ONLY,
  LAYOUT_TYPE.PRESENTATION_ONLY,
  LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
  LAYOUT_TYPE.MEDIA_ONLY,
];

/** The unified layout, which also renders every layout type the client does not know. */
export const isUnifiedLayout = (s: ShellInputs) => !SPECIAL_LAYOUTS.includes(s.layoutType);

/** The layout a type renders as (the value of #layout[data-layout]): unknown types render as unified. */
export const renderedLayoutType = (layoutType: string) => (SPECIAL_LAYOUTS.includes(layoutType)
  ? layoutType
  : LAYOUT_TYPE.UNIFIED_LAYOUT);

const MEDIA_FULLSCREEN_ELEMENTS = ['Presentation', 'Screenshare', 'ExternalVideo', 'GenericContent'];

/** A media region (presentation, screen share, external video, plugin content) is in fullscreen. */
export const isMediaFullscreen = (s: ShellInputs) => MEDIA_FULLSCREEN_ELEMENTS.includes(s.fullscreenElement);

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

/**
 * The engine's branch order in calculatesCameraDockBounds: hidden (no cameras, or a layout without a
 * dock), webcams fullscreen, filling the media area (presentation closed or no media), else positioned.
 */
export const cameraDockState = (s: ShellInputs): CameraDockState => {
  if (s.layoutType === LAYOUT_TYPE.PRESENTATION_ONLY
    || s.layoutType === LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY) return 'hidden';
  // the other layouts give no cameras an empty dock (layoutEngine baseCameraDockBounds)
  if (s.numCameras === 0 && !isUnifiedLayout(s)) return 'hidden';
  if (s.numCameras === 0 && hasPresentationSlides(s) && s.presentationIsOpen) return 'hidden';
  if (s.fullscreenGroup === 'webcams') return 'fullscreen';
  if (!s.presentationIsOpen || isMediaContentOff(s)) return 'fill';
  return 'positioned';
};

/**
 * The position the dock reports (the engine's cameraDock.position): the drawn one in unified, none in
 * camerasOnly, below the sidebar in the sidebar-only layouts (where the dock never shows).
 */
export const cameraDockPosition = (s: ShellInputs): string | undefined => {
  switch (s.layoutType) {
    case LAYOUT_TYPE.CAMERAS_ONLY:
      return undefined;
    case LAYOUT_TYPE.PRESENTATION_ONLY:
    case LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY:
      return CAMERADOCK_POSITION.SIDEBAR_CONTENT_BOTTOM;
    case LAYOUT_TYPE.MEDIA_ONLY:
      // the dock sits beside a content limited by the area's height, above any other
      if (cameraDockState(s) !== 'positioned') return undefined;
      return s.mediaOnlyFit === 'height' ? CAMERADOCK_POSITION.CONTENT_LEFT : CAMERADOCK_POSITION.CONTENT_TOP;
    default:
      return effectiveCameraDockPosition(s);
  }
};

/**
 * The media box makes room for the dock (calculatesMediaBounds' camera branch): cameras on, no dock being
 * dragged, no media in fullscreen. presentationOnly lays its media out without the dock, and mediaOnly
 * around the content's own size.
 */
export const isMediaBesideDock = (s: ShellInputs) => s.numCameras > 0
  && !s.isDragging
  && !isMediaFullscreen(s)
  && s.layoutType !== LAYOUT_TYPE.PRESENTATION_ONLY
  && s.layoutType !== LAYOUT_TYPE.MEDIA_ONLY;

const isSideDock = (position: string) => position === CAMERADOCK_POSITION.CONTENT_LEFT
  || position === CAMERADOCK_POSITION.CONTENT_RIGHT;

const isTopOrBottomDock = (position: string) => position === CAMERADOCK_POSITION.CONTENT_TOP
  || position === CAMERADOCK_POSITION.CONTENT_BOTTOM;

/**
 * The media box of each layout manager, reduced to whether it has an area. Special layouts hide the
 * media regions (camerasOnly, participantsAndChatOnly) or show them only while the presentation is open.
 * In unified the box is empty while the presentation is closed; the media width is the window less the
 * sidebars, nothing on a phone with a sidebar open; a dock that fills the area or the window leaves a
 * side dock's neighbour no width and a top or bottom dock's neighbour a negative height.
 */
export const mediaBoxCollapse = (s: ShellInputs): MediaBoxCollapse => {
  switch (s.layoutType) {
    case LAYOUT_TYPE.CAMERAS_ONLY:
    case LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY:
      return 'zero';
    case LAYOUT_TYPE.PRESENTATION_ONLY:
      return s.presentationIsOpen ? 'none' : 'zero';
    case LAYOUT_TYPE.MEDIA_ONLY:
      return s.presentationIsOpen && !isMediaContentOff(s) ? 'none' : 'zero';
    default:
  }
  if (!s.presentationIsOpen) return 'zero';
  if (isMediaFullscreen(s)) return 'none';
  if (isMobile(s) && (s.sidebarContentIsOpen || s.sidebarContentAuxiliaryIsOpen)) return 'zero';
  if (isMediaBesideDock(s)) {
    const dock = cameraDockState(s);
    const position = effectiveCameraDockPosition(s);
    if (dock === 'fullscreen' || dock === 'fill') {
      if (isSideDock(position)) return 'zero';
      if (isTopOrBottomDock(position)) return 'negative';
    }
  }
  return 'none';
};

/**
 * The dock shows (the engine's cameraDock.display): in unified with cameras or with the presentation
 * closed (the camera grid), always in camerasOnly, with cameras in mediaOnly, never in the sidebar-only
 * layouts.
 */
export const isCameraDockShown = (s: ShellInputs) => {
  switch (s.layoutType) {
    case LAYOUT_TYPE.CAMERAS_ONLY:
      return true;
    case LAYOUT_TYPE.PRESENTATION_ONLY:
    case LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY:
      return false;
    case LAYOUT_TYPE.MEDIA_ONLY:
      return s.numCameras > 0;
    default:
      return s.numCameras > 0 || !s.presentationIsOpen;
  }
};

/** The engine's isMediaOpen: the media box has a positive width and height. */
const isMediaOpen = (s: ShellInputs) => mediaBoxCollapse(s) === 'none';

/** Only the unified layout lets the dock be dragged; never on phones or while locked. */
export const isCameraDockDraggable = (s: ShellInputs) => isUnifiedLayout(s)
  && !isMobile(s)
  && !isSideBySideCamerasEnforced(s)
  && isMediaOpen(s);

/** The dock edges that resize; from the raw position the user chose, mirrored in RTL. */
export const resizableCameraDockEdges = (s: ShellInputs): Edges => {
  const can = isUnifiedLayout(s) && isMediaOpen(s) && !isSideBySideCamerasEnforced(s);
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

/** A top dock on a phone and a dock locked side by side always use their default size. */
const usesDefaultDockSize = (s: ShellInputs) => isSideBySideCamerasEnforced(s)
  || (effectiveCameraDockPosition(s) === CAMERADOCK_POSITION.CONTENT_TOP && isMobile(s));

/** The live dock size along its axis (px) while the user drags the handle, undefined otherwise. */
export const cameraDockSizeVariable = (s: ShellInputs): number | undefined => {
  if (!s.isResizing || usesDefaultDockSize(s)) return undefined;
  return isSideDock(effectiveCameraDockPosition(s)) ? s.dockInputWidth : s.dockInputHeight;
};

/**
 * The stored dock size for the dock's axis, a fraction (0-1) of its area, or undefined when not set
 * (the CSS default applies). The CSS layout renders it as that share of the area.
 */
export const cameraDockFractionVariable = (s: ShellInputs): number | undefined => {
  if (usesDefaultDockSize(s)) return undefined;
  const stored = isSideDock(effectiveCameraDockPosition(s)) ? s.storedDockWidth : s.storedDockHeight;
  return stored > 0 ? stored : undefined;
};
