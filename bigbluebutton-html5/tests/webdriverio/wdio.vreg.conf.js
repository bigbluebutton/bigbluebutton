var path = require('path');
var VisualRegressionCompare = require('wdio-visual-regression-service/compare');
function getScreenshotName(basePath) {
  return function(context) {
    var type = context.type;
    var testName = context.test.title;
    var browserVersion = parseInt(context.browser.version, 10);
    var browserName = context.browser.name;
    var browserViewport = context.meta.viewport;
    var browserWidth = browserViewport.width;
    var browserHeight = browserViewport.height;
    return path.join(basePath, `${testName}_${type}_${browserWidth}_${browserHeight}.png`);
  };
}

exports.config = {
   
    specs: [
        'tests/webdriverio/specs/visual-regression/**/*.spec.js'
    ],

    capabilities: [{
        maxInstances: 5,
        browserName: 'chrome'
    }],

    sync: true,
    logLevel: 'verbose',
    bail: 0,

    host: 'localhost',
    port: 4444,

    baseUrl: 'http://localhost:8080',

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
      viewports: [{ width: 1920, height: 1200 }, { width: 960, height: 1200 }],
      viewportChangePause: 300,
      orientations: ['landscape'],
    },

    framework: 'jasmine',
    jasmineNodeOpts: {
      defaultTimeoutInterval: 30000
    },

    reporters: ['spec'],
}

