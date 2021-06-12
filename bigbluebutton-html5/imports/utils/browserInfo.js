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

const browserInfo = {
  isChrome,
  isSafari,
  isEdge,
  isIe,
  isFirefox,
  browserName,
  versionNumber,
  isValidSafariVersion,
};

export default browserInfo;
