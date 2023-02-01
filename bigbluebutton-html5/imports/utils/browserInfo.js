import Bowser from 'bowser';

const BOWSER_RESULTS = Bowser.parse(window.navigator.userAgent);

const isChrome = BOWSER_RESULTS.browser.name === 'Chrome';
const isSafari = BOWSER_RESULTS.browser.name === 'Safari';
const isEdge = BOWSER_RESULTS.browser.name === 'Microsoft Edge';
const isIe = BOWSER_RESULTS.browser.name === 'Internet Explorer';
const isFirefox = BOWSER_RESULTS.browser.name === 'Firefox';

const browserName = BOWSER_RESULTS.browser.name;
const versionNumber = BOWSER_RESULTS.browser.version;

const isValidSafariVersion = Bowser.getParser(window.navigator.userAgent).satisfies({
  safari: '>12',
});

// Check whether Chrome's 'Auto Dark Mode' is enabled
// See: https://developer.chrome.com/blog/auto-dark-theme/#detecting-auto-dark-theme
const isChromeAutoDarkModeEnabled = () => {
  const detection = document.createElement('div');
  detection.style.display = 'none';
  detection.style.backgroundColor = 'canvas';
  detection.style.colorScheme = 'light';
  document.body.appendChild(detection);
  const isChromeAutoDarkModeEnabled = getComputedStyle(detection).backgroundColor !== 'rgb(255, 255, 255)';
  document.body.removeChild(detection);
  return isChromeAutoDarkModeEnabled;
};

const browserInfo = {
  isChrome,
  isSafari,
  isEdge,
  isIe,
  isFirefox,
  browserName,
  versionNumber,
  isValidSafariVersion,
  isChromeAutoDarkModeEnabled,
};

export default browserInfo;
