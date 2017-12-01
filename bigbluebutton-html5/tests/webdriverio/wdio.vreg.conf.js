let path = require('path');
let VisualRegressionCompare = require('wdio-visual-regression-service/compare');
let merge = require('deepmerge');
let wdioBaseConf = require('./wdio.base.conf');

function getScreenshotName(basePath) {
  return function(context) {
    var type = context.type;
    var testName = context.test.title;
    var browserVersion = parseInt(context.browser.version, 10);
    var browserName = process.env.BROWSER_NAME === 'chrome_mobile' ? process.env.DEVICE_NAME : context.browser.name;
    var browserViewport = context.meta.viewport;
    var browserWidth = browserViewport.width;
    var browserHeight = browserViewport.height;
    return path.join(
      basePath,
      browserName,
      `${browserWidth}x${browserHeight}`,
      `${testName}_${type}.png`
    );
  };
}

exports.config = merge(wdioBaseConf.config, {
  specs: [
    'tests/webdriverio/specs/visual-regression/**/*.spec.js'
  ],

  capabilities: [process.env.BROWSER_NAME=='chrome_mobile' ? {
    maxInstances: 5,
    browserName: 'chrome',
    chromeOptions: {
      mobileEmulation: {
        deviceName: process.env.DEVICE_NAME
      }
    }
  } : {
    maxInstances: 5,
    browserName: process.env.BROWSER_NAME
  }],

  baseUrl: 'http://localhost:8080',
  framework: 'jasmine',
  reporters: ['spec'],

  sync: true,
  logLevel: 'silent',
  bail: 0,
  host: 'localhost',
  port: 4444,
  waitforTimeout: 30000,
  connectionRetryTimeout: 90000,
  connectionRetryCount: 3,
  services: ['visual-regression'],
  visualRegression: {
    compare: new VisualRegressionCompare.LocalCompare({
      referenceName: getScreenshotName(path.join(process.cwd(), 'tests/webdriverio/screenshots/reference')),
      screenshotName: getScreenshotName(path.join(process.cwd(), 'tests/webdriverio/screenshots/screen')),
      diffName: getScreenshotName(path.join(process.cwd(), 'tests/webdriverio/screenshots/diff')),
      misMatchTolerance: 0.01,
    }),
    viewports: process.env.BROWSER_NAME === 'chrome_mobile' ? [] : [{ width: 1920, height: 1200 }, { width: 960, height: 1200 }],
    viewportChangePause: 300,
    orientations: ['landscape'],
  },

  jasmineNodeOpts: {
    defaultTimeoutInterval: 30000
  },
});

