'use strict';

class Page {
  open(path) {
    browser.url(path);
  }

  pressEnter() {
    browser.keys('Enter');
  }
}

module.exports = Page;

