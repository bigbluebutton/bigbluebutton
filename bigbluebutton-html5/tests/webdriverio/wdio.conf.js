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

