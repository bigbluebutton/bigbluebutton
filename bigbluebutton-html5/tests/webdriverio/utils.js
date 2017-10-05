'use strict';

let chai = require('chai');
let LandingPage = require('./pageobjects/landing.page');

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
  setUsername(map) {
    map.forEach((v, k) => browser.select(k).setValue(LandingPage.usernameInputSelector, v));
  }
}

module.exports = new Utils();

