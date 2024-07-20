import Bowser from 'bowser';
import logger from '/imports/startup/client/logger';

const userAgent = window.navigator.userAgent;
const BOWSER_RESULTS = Bowser.parse(userAgent);

const isChrome = BOWSER_RESULTS.browser.name === 'Chrome';
const isSafari = BOWSER_RESULTS.browser.name === 'Safari';
const isEdge = BOWSER_RESULTS.browser.name === 'Microsoft Edge';
const isIe = BOWSER_RESULTS.browser.name === 'Internet Explorer';
const isFirefox = BOWSER_RESULTS.browser.name === 'Firefox';

const browserName = BOWSER_RESULTS.browser.name;

const getVersionNumber = () => {
  if (BOWSER_RESULTS.browser.version) return BOWSER_RESULTS.browser.version;

  // There are some scenarios (e.g.; WKWebView) where Bowser can't detect the
  // Safari version. In such cases, we can use the WebKit version to determine
  // it.
  if (isSafari && BOWSER_RESULTS.engine.version) return BOWSER_RESULTS.engine.version;

  // If the version number is not available, log an warning and return Infinity
  // so that we do not deny access to the user (even if we're uncertain about
  // whether it's a supported browser).
  logger.warn({
    logCode: 'browserInfo_invalid_version',
    extraInfo: {
      userAgent,
    },
  }, 'Unable to determine the browser version number');

  return 'Infinity';
};

const versionNumber = getVersionNumber();

const isValidSafariVersion = Bowser.getParser(userAgent).satisfies({
  safari: '>12',
});

const isTabletApp =  !!(userAgent.match(/BigBlueButton-Tablet/i));

const browserInfo = {
  isChrome,
  isSafari,
  isEdge,
  isIe,
  isFirefox,
  browserName,
  versionNumber,
  isValidSafariVersion,
  isTabletApp
};

export default browserInfo;
