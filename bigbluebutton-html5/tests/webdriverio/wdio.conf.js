var path = require('path');

function getScreenshotName(basePath) {
  return function(context) {
    var testName = context.test.title;
    var resolution = context.meta.width || context.meta.orientation || 'unknown';
    var browserVersion = parseInt(/\d+/.exec(context.browser.version)[0]);
    var browserName = context.browser.name;

    return path.join(basePath, `${testName}_${resolution}_${browserName}_v${browserVersion}.png`);
  };
}

exports.config = {
  specs: ['tests/webdriverio/specs/**/*.spec.js'],
  capabilities: {
    chromeBrowser: {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },
    chromeDevBrowser: {
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          binary: '/opt/google/chrome-unstable/google-chrome-unstable'
        }
      }
    },
    firefoxBrowser: {
      desiredCapabilities: {
        browserName: 'firefox'
      }
    },
    firefoxNightlyBrowser: {
      desiredCapabilities: {
        browserName: 'firefox',
        firefox_binary: '/usr/lib/firefox-trunk/firefox-trunk'
      }
    },
    chromeMobileBrowser: {
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          mobileEmulation: {
            deviceName: 'Apple iPhone 6'
          }
        }
      }
    }
  },
  baseUrl: 'http://localhost:8080',
  framework: 'jasmine',
  reporters: ['spec', 'junit'],
  reporterOptions: {
    junit: {
      outputDir: './tests/webdriverio/reports',
    },
  },
  screenshotPath: 'screenshots',
  suites: {
    login: [
      'tests/webdriverio/specs/login.spec.js',
    ],
  },
  before: function() {
    // make the properties that browsers share and the list of browserNames available:
    browser.remotes = Object.keys(exports.config.capabilities);
    browser.baseUrl = exports.config.baseUrl;
  },
};

