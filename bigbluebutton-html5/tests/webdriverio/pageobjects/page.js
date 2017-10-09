'use strict';

class Page {
  open(path) {
    browser.url(path);
  }

  pressEnter() {
    chromeBrowser.keys('Enter');
  }

  isFirefox() {
    return browser.desiredCapabilities.browserName == 'firefox';
  }
}

module.exports = Page;

