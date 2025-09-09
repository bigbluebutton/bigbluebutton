import {
  DEVICE_TYPE,
  LAYOUT_ELEMENTS,
  LAYOUT_TYPE,
  SYNC,
} from './enums';

const phoneUpperBoundary = 600;
const tabletPortraitUpperBoundary = 900;
const tabletLandscapeUpperBoundary = 1200;
const WAIT_LAYOUT_PARAMETER = 'waitLayout';

const windowSize = () => window.document.documentElement.clientWidth;
const isMobile = () => windowSize() <= (phoneUpperBoundary - 1);
const isTabletPortrait = () => windowSize() >= phoneUpperBoundary
  && windowSize() <= (tabletPortraitUpperBoundary - 1);
const isTabletLandscape = () => windowSize() >= tabletPortraitUpperBoundary
  && windowSize() <= (tabletLandscapeUpperBoundary - 1);
const isTablet = () => windowSize() >= phoneUpperBoundary
  && windowSize() <= (tabletLandscapeUpperBoundary - 1);
const isDesktop = () => windowSize() >= tabletLandscapeUpperBoundary;

const getWaitLayout = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(WAIT_LAYOUT_PARAMETER) || false;
};

const device = {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
};

export default device;
export {
  isMobile, isTablet, isTabletPortrait, isTabletLandscape, isDesktop,
};

// Array for select component to select different layout
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

const COMMON_ELEMENTS = {
  DEFAULT: [
    LAYOUT_ELEMENTS.LAYOUT_TYPE,
    LAYOUT_ELEMENTS.PRESENTATION_STATE,
    LAYOUT_ELEMENTS.FOCUSED_CAMERA,
  ],
  DOCK: [
    LAYOUT_ELEMENTS.CAMERA_DOCK_POSITION,
    LAYOUT_ELEMENTS.CAMERA_DOCK_SIZE,
  ],
};

const LAYOUTS_SYNC = {
  [LAYOUT_TYPE.CUSTOM_LAYOUT]: {
    [SYNC.PROPAGATE_ELEMENTS]: [...COMMON_ELEMENTS.DEFAULT, ...COMMON_ELEMENTS.DOCK],
    [SYNC.REPLICATE_ELEMENTS]: [...COMMON_ELEMENTS.DEFAULT, ...COMMON_ELEMENTS.DOCK],
  },
  [LAYOUT_TYPE.SMART_LAYOUT]: {
    [SYNC.PROPAGATE_ELEMENTS]: COMMON_ELEMENTS.DEFAULT,
    [SYNC.REPLICATE_ELEMENTS]: COMMON_ELEMENTS.DEFAULT,
  },
  [LAYOUT_TYPE.PRESENTATION_FOCUS]: {
    [SYNC.PROPAGATE_ELEMENTS]: COMMON_ELEMENTS.DEFAULT,
    [SYNC.REPLICATE_ELEMENTS]: COMMON_ELEMENTS.DEFAULT,
  },
  [LAYOUT_TYPE.VIDEO_FOCUS]: {
    [SYNC.PROPAGATE_ELEMENTS]: COMMON_ELEMENTS.DEFAULT,
    [SYNC.REPLICATE_ELEMENTS]: COMMON_ELEMENTS.DEFAULT,
  },
  // Hidden layouts are now able to replicate their layout type, as it's currently possible
  // to change them via plugin ui-commands and those need to be followed correctly.
  [LAYOUT_TYPE.CAMERAS_ONLY]: {
    [SYNC.PROPAGATE_ELEMENTS]: [],
    [SYNC.REPLICATE_ELEMENTS]: [LAYOUT_ELEMENTS.FOCUSED_CAMERA, LAYOUT_ELEMENTS.LAYOUT_TYPE],
  },
  [LAYOUT_TYPE.PRESENTATION_ONLY]: {
    [SYNC.PROPAGATE_ELEMENTS]: [],
    [SYNC.REPLICATE_ELEMENTS]: [LAYOUT_ELEMENTS.LAYOUT_TYPE],
  },
  [LAYOUT_TYPE.PARTICIPANTS_AND_CHAT_ONLY]: {
    [SYNC.PROPAGATE_ELEMENTS]: [],
    [SYNC.REPLICATE_ELEMENTS]: [LAYOUT_ELEMENTS.LAYOUT_TYPE],
  },
  [LAYOUT_TYPE.PLUGINS_ONLY]: {
    [SYNC.PROPAGATE_ELEMENTS]: [],
    [SYNC.REPLICATE_ELEMENTS]: [LAYOUT_ELEMENTS.LAYOUT_TYPE],
  },
  [LAYOUT_TYPE.MEDIA_ONLY]: {
    [SYNC.PROPAGATE_ELEMENTS]: [],
    [SYNC.REPLICATE_ELEMENTS]: [
      LAYOUT_ELEMENTS.FOCUSED_CAMERA,
      LAYOUT_ELEMENTS.PRESENTATION_STATE,
      LAYOUT_ELEMENTS.LAYOUT_TYPE,
    ],
  },
};
export { suportedLayouts, LAYOUTS_SYNC, getWaitLayout };
