'use strict';

let expect = require('chai').expect;
let LandingPage = require('./pageobjects/landing.page');

class Utils {
  assertTitle(title) {
    browser.remotes.forEach(function(browserName) {
      expect(browser.select(browserName).getTitle()).to.equal(title);
    });
  }
  assertUrl(url) {
    browser.remotes.forEach(function(browserName) {
      expect(browser.getUrl()[browserName]).to.equal(url);
    });
  }
  setUsername(map) {
    map.forEach((v, k) => browser.select(k).setValue(LandingPage.usernameInputSelector, v));
  }
  expectImageMatch(results, errorMessage) {
    results.forEach((result) => expect(result.isExactSameImage, errorMessage).to.be.true);
  }
}

module.exports = new Utils();

