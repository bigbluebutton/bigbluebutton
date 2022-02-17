import { DEVICE_TYPE, LAYOUT_TYPE } from './enums';

const phoneUpperBoundary = 600;
const tabletPortraitUpperBoundary = 900;
const tabletLandscapeUpperBoundary = 1200;

const windowSize = () => window.document.documentElement.clientWidth;
const isMobile = () => windowSize() <= (phoneUpperBoundary - 1);
const isTabletPortrait = () => windowSize() >= phoneUpperBoundary
  && windowSize() <= (tabletPortraitUpperBoundary - 1);
const isTabletLandscape = () => windowSize() >= tabletPortraitUpperBoundary
  && windowSize() <= (tabletLandscapeUpperBoundary - 1);
const isTablet = () => windowSize() >= phoneUpperBoundary
  && windowSize() <= (tabletLandscapeUpperBoundary - 1);
const isDesktop = () => windowSize() >= tabletLandscapeUpperBoundary;

const device = {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
};

export default device;
export {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
};

// Array for select component to select diferent layout
const suportedLayouts = [
  {
    layoutKey: LAYOUT_TYPE.SMART_LAYOUT,
    layoutName: 'Smart Layout',
    suportedDevices: [
      DEVICE_TYPE.MOBILE,
      DEVICE_TYPE.TABLET,
      DEVICE_TYPE.TABLET_PORTRAIT,
      DEVICE_TYPE.TABLET_LANDSCAPE,
      DEVICE_TYPE.DESKTOP,
    ],
  },
  {
    layoutKey: LAYOUT_TYPE.VIDEO_FOCUS,
    layoutName: 'Video Focus',
    suportedDevices: [
      DEVICE_TYPE.MOBILE,
      DEVICE_TYPE.TABLET,
      DEVICE_TYPE.TABLET_PORTRAIT,
      DEVICE_TYPE.TABLET_LANDSCAPE,
      DEVICE_TYPE.DESKTOP,
    ],
  },
  {
    layoutKey: LAYOUT_TYPE.PRESENTATION_FOCUS,
    layoutName: 'Presentation Focus',
    suportedDevices: [
      DEVICE_TYPE.MOBILE,
      DEVICE_TYPE.TABLET,
      DEVICE_TYPE.TABLET_PORTRAIT,
      DEVICE_TYPE.TABLET_LANDSCAPE,
      DEVICE_TYPE.DESKTOP,
    ],
  },
  {
    layoutKey: LAYOUT_TYPE.CUSTOM_LAYOUT,
    layoutName: 'Custom Layout',
    suportedDevices: [
      DEVICE_TYPE.DESKTOP,
    ],
  },
];
export { suportedLayouts };
