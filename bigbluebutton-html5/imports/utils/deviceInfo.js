import Bowser from 'bowser';

const BOWSER_RESULTS = Bowser.parse(window.navigator.userAgent);

const isPhone = BOWSER_RESULTS.platform.type === 'mobile';
// we need a 'hack' to correctly detect ipads with ios > 13
const isTablet = BOWSER_RESULTS.platform.type === 'tablet' || (BOWSER_RESULTS.os.name === 'macOS' && window.navigator.maxTouchPoints > 0);
const isMobile = isPhone || isTablet;
const hasMediaDevices = !!navigator.mediaDevices;
const osName = BOWSER_RESULTS.os.name;

const isPortrait = () => window.innerHeight > window.innerWidth;

const deviceInfo = {
  isTablet,
  isPhone,
  isMobile,
  hasMediaDevices,
  osName,
  isPortrait,
};

export default deviceInfo;
