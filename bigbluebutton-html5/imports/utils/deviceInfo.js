import Bowser from 'bowser';

export const { userAgent } = window.navigator;
export const BOWSER_RESULTS = Bowser.parse(userAgent);

const isPhone = BOWSER_RESULTS.platform.type === 'mobile';
// we need a 'hack' to correctly detect ipads with ios > 13
export const isTablet = BOWSER_RESULTS.platform.type === 'tablet' || (BOWSER_RESULTS.os.name === 'macOS' && window.navigator.maxTouchPoints > 0);
export const isMobile = isPhone || isTablet;
export const hasMediaDevices = !!navigator.mediaDevices;
export const osName = BOWSER_RESULTS.os.name;
export const osVersion = BOWSER_RESULTS.os.version;
export const isIos = osName === 'iOS' || (isTablet && osName === 'macOS');
export const isMacos = osName === 'macOS';
export const isIphone = !!(userAgent.match(/iPhone/i));

// documentElement, the metric the layout managers measure and the resize dispatch
// carries. window.inner* diverges from it on mobile.
export const isPortrait = () => window.document.documentElement.clientHeight
  > window.document.documentElement.clientWidth;

// Tablets are deliberately left out: they keep the regular layout behavior.
export const isPhoneLandscape = () => isPhone && !isPortrait();

const deviceInfo = {
  isTablet,
  isPhone,
  isMobile,
  hasMediaDevices,
  osName,
  osVersion,
  isPortrait,
  isPhoneLandscape,
  isIos,
  isMacos,
  isIphone,
};

export default deviceInfo;
