let merge = require('deepmerge');
let wdioBaseConf = require('./wdio.base.conf');

exports.config = merge(wdioBaseConf.config, {

  specs: ['tests/webdriverio/specs/acceptance/**/*.spec.js'],

  capabilities: {
    chromeBrowser: {
      desiredCapabilities: {
        browserName: 'chrome'
      }
    },
    firefoxBrowser: {
      desiredCapabilities: {
        browserName: 'firefox'
      }
    },
    chromeMobileBrowser: {
      desiredCapabilities: {
        browserName: 'chrome',
        chromeOptions: {
          mobileEmulation: {
            deviceName: 'iPhone 6'
          }
        }
      }
    }
  },

  suites: {
    login: [
      'tests/webdriverio/specs/acceptance/login.spec.js',
    ],
  },
  before: function() {
    // make the properties that browsers share and the list of browserNames available:
    browser.remotes = Object.keys(exports.config.capabilities);
    browser.baseUrl = exports.config.baseUrl;
  },
});

