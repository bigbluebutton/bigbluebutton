'use strict';

let chai = require('chai');

class Utils {
  assertTitle(title) {
    browser.remotes.forEach(function(browserName) {
      chai.expect(browser.select(browserName).getTitle()).to.equal(title);
    });
  }
  assertUrl(url) {
    browser.remotes.forEach(function(browserName) {
      chai.expect(browser.getUrl()[browserName]).to.equal(url);
    });
  }
}

module.exports = new Utils();

