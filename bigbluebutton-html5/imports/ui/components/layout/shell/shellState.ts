import { DEVICE_TYPE, LAYOUT_TYPE } from '../enums';
import {
  cameraDockPosition,
  cameraDockSizeVariable,
  cameraDockState,
  isMediaContentOff,
  isMediaBesideDock,
  isMediaFullscreen,
  isSideBySideCamerasEnforced,
  mediaBoxCollapse,
  renderedLayoutType,
  ShellInputs,
} from './selectors';

/** Everything the CSS layout needs from the layout state: semantic flags and the sizes the user chose. */
export interface ShellState extends ShellInputs {
  /** an enforced layout is still loading (waitLayout): the layout type is not known yet */
  layoutPending: boolean;
  hasBanner: boolean;
  hasNotification: boolean;
  hasNavBar: boolean;
  hideTopRow: boolean;
  hasActionBar: boolean;
  sidebarNavigationIsOpen: boolean;
  /** the width the user dragged the sidebar to, 0 when never resized */
  sidebarContentWidth: number;
  sidebarContentAuxiliaryWidth: number;
  /** the current user presents: a side dock leaves the presentation toolbar its width */
  isPresenter: boolean;
  /** mediaOnly: the content's aspect ratio (width / height), 0 without a content size */
  mediaOnlyContentRatio: number;
  /** the camera grid size the video list computed, for the drag preview */
  cameraGridWidth: number;
  cameraGridHeight: number;
}

export interface ShellOutput {
  attributes: Record<string, string>;
  style: Record<string, string>;
  /** the state they were derived from, for the regions that act on it in JS (shell/context.ts) */
  state?: ShellState;
}

const navBarVariant = (s: ShellState) => {
  if (!s.hasNavBar) return 'hidden';
  return s.hideTopRow ? 'half' : 'full';
};

/** The data attributes and custom properties #layout carries; the CSS layout reads nothing else. */
export const shellState = (s: ShellState): ShellOutput => {
  const flags: Record<string, boolean> = {
    'data-mobile': s.deviceType === DEVICE_TYPE.MOBILE,
    'data-rtl': s.isRTL,
    'data-nav-open': s.sidebarNavigationIsOpen,
    'data-content-open': s.sidebarContentIsOpen,
    'data-aux-open': s.sidebarContentAuxiliaryIsOpen,
    'data-cameras': s.numCameras > 0,
    'data-presentation-open': s.presentationIsOpen,
    'data-has-slides': s.presentationEnabled && s.slidesLength !== 0,
    'data-media-off': isMediaContentOff(s),
    'data-dock-enforced': isSideBySideCamerasEnforced(s),
    'data-phone-landscape': s.isPhoneLandscape,
    'data-dragging': s.isDragging,
    'data-presenter': s.isPresenter,
    'data-resizing': s.isResizing,
    'data-fullscreen-media': isMediaFullscreen(s),
    'data-media-beside-dock': isMediaBesideDock(s),
  };
  const attributes: Record<string, string> = {};
  // the contract tests and plugins read; absent while an enforced layout loads (waitLayout)
  if (!s.layoutPending) attributes['data-layout'] = renderedLayoutType(s.layoutType);
  attributes['data-device'] = s.deviceType;
  attributes['data-navbar'] = navBarVariant(s);
  attributes['data-actionbar'] = s.hasActionBar ? 'shown' : 'hidden';
  attributes['data-banners'] = String(Number(s.hasBanner) + Number(s.hasNotification));
  Object.entries(flags).forEach(([name, on]) => {
    if (on) attributes[name] = '';
  });
  attributes['data-dock'] = cameraDockPosition(s) ?? '';
  attributes['data-dock-state'] = cameraDockState(s);
  attributes['data-media-box'] = mediaBoxCollapse(s);
  if (s.layoutType === LAYOUT_TYPE.MEDIA_ONLY) attributes['data-media-only-fit'] = s.mediaOnlyFit;

  const style: Record<string, string> = {};
  if (s.sidebarContentWidth > 0) style['--bbb-sidebar-content-size'] = `${s.sidebarContentWidth}px`;
  if (s.sidebarContentAuxiliaryWidth > 0) style['--bbb-sidebar-aux-size'] = `${s.sidebarContentAuxiliaryWidth}px`;
  const dockSize = cameraDockSizeVariable(s);
  if (dockSize !== undefined) style['--bbb-camera-dock-size'] = `${dockSize}px`;
  if (s.cameraGridWidth > 0) style['--bbb-camera-grid-width'] = `${s.cameraGridWidth}px`;
  if (s.cameraGridHeight > 0) style['--bbb-camera-grid-height'] = `${s.cameraGridHeight}px`;
  if (s.mediaOnlyContentRatio > 0) style['--bbb-media-only-ratio'] = String(s.mediaOnlyContentRatio);
  return { attributes, style, state: s };
};

export default shellState;
