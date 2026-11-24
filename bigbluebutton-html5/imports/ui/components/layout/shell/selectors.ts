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
  /** the stored dock size (sessionStorage BBB_webcamSize), 0 when never resized */
  storedDockWidth: number;
  storedDockHeight: number;
  sidebarContentIsOpen: boolean;
  sidebarContentAuxiliaryIsOpen: boolean;
  /** the element in fullscreen (Presentation, Screenshare, ExternalVideo, GenericContent, ...) */
  fullscreenElement: string;
  /** the camera dock is being dragged */
  isDragging: boolean;
}

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

const isTablet = (s: ShellInputs) => s.deviceType === DEVICE_TYPE.TABLET;

const SPECIAL_LAYOUTS = [
  LAYOUT_TYPE.CAMERAS_ONLY,
  LAYOUT_TYPE.PRESENTATION_ONLY,
  LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY,
  LAYOUT_TYPE.MEDIA_ONLY,
];

/** The unified layout, which also renders every layout type the client does not know. */
export const isUnifiedLayout = (s: ShellInputs) => !SPECIAL_LAYOUTS.includes(s.layoutType);

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

/** The engine's branch order in calculatesCameraDockBounds: hidden, then fill, then webcams fullscreen. */
export const cameraDockState = (s: ShellInputs): CameraDockState => {
  if (s.numCameras === 0 && hasPresentationSlides(s) && s.presentationIsOpen) return 'hidden';
  if (s.fullscreenGroup === 'webcams') return 'fullscreen';
  if (!s.presentationIsOpen || isMediaContentOff(s)) return 'fill';
  return 'positioned';
};

/**
 * The media box makes room for the dock (calculatesMediaBounds' camera branch): cameras on, no dock being
 * dragged, no media in fullscreen. presentationOnly lays its media out without the dock.
 */
export const isMediaBesideDock = (s: ShellInputs) => s.numCameras > 0
  && !s.isDragging
  && !isMediaFullscreen(s)
  && s.layoutType !== LAYOUT_TYPE.PRESENTATION_ONLY;

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

/** Only the unified layout lets the dock be dragged; never on phones and tablets or while locked. */
export const isCameraDockDraggable = (s: ShellInputs) => isUnifiedLayout(s)
  && !isMobile(s)
  && !isTablet(s)
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

/**
 * The dock size the user chose along the dock's axis (px), or undefined when the CSS default applies:
 * the live size while resizing, otherwise the stored one. A top dock on a phone and a dock locked side by
 * side always use their default.
 */
export const cameraDockSizeVariable = (s: ShellInputs): number | undefined => {
  const position = effectiveCameraDockPosition(s);
  const horizontal = isSideDock(position);
  if (isSideBySideCamerasEnforced(s)) return undefined;
  if (position === CAMERADOCK_POSITION.CONTENT_TOP && isMobile(s)) return undefined;
  const stored = horizontal ? s.storedDockWidth : s.storedDockHeight;
  if (stored === 0 && !s.isResizing) return undefined;
  if (s.isResizing) return horizontal ? s.dockInputWidth : s.dockInputHeight;
  return stored;
};
