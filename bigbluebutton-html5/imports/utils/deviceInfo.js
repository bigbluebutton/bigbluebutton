import Bowser from 'bowser';

const userAgent = window.navigator.userAgent;
const BOWSER_RESULTS = Bowser.parse(userAgent);

const isPhone = BOWSER_RESULTS.platform.type === 'mobile';
// we need a 'hack' to correctly detect ipads with ios > 13
const isTablet = BOWSER_RESULTS.platform.type === 'tablet' || (BOWSER_RESULTS.os.name === 'macOS' && window.navigator.maxTouchPoints > 0);
const isMobile = isPhone || isTablet;
const hasMediaDevices = !!navigator.mediaDevices;
const osName = BOWSER_RESULTS.os.name;
const isIos = osName === 'iOS' || (isTablet && osName=="macOS");
const isMacos = osName === 'macOS';
const isIphone = !!(userAgent.match(/iPhone/i));

const isPortrait = () => window.innerHeight > window.innerWidth;

const deviceInfo = {
  isTablet,
  isPhone,
  isMobile,
  hasMediaDevices,
  osName,
  isPortrait,
  isIos,
  isMacos,
  isIphone,
};

export default deviceInfo;
