'use strict';

let LandingPage = require('../../pageobjects/landing.page');
let chai = require('chai');
let utils = require('../../utils');

describe('Landing page', function () {

  beforeEach(function () {
    jasmine.DEFAULT_TIMEOUT_INTERVAL = 30000; // default value is 10000
  });

  it('should have correct title', function () {
    LandingPage.open();
    utils.assertTitle(LandingPage.title);
  });

  it('should allow user to login if the username is specified and the Join button is clicked',
    function () {
      LandingPage.open();

      utils.setUsername(new Map([
        ['chromeBrowser', 'Alex'],
        ['chromeBrowser', 'Anton'],
        ['firefoxBrowser', 'Danny'],
        ['firefoxBrowser', 'Maxim'],
        ['chromeMobileBrowser', 'Oswaldo']
      ]));

      LandingPage.joinWithButtonClick();
      LandingPage.loadedHomePageElement.waitForExist(5000);
    });

  it('should not allow user to login if the username is not specified (login using a button)',
    function () {
      LandingPage.open();

      // we intentionally don't enter username here

      LandingPage.joinWithButtonClick();

      browser.pause(5000); // amount of time we usually wait for the home page to appear

      // verify that we are still on the landing page
      utils.assertUrl(LandingPage.url);
    });

    it('should allow user to login if the username is specified and then Enter key is pressed',
      function () { // Chrome-only
        LandingPage.open();

        chromeBrowser.setValue(LandingPage.usernameInputSelector, 'Maxim');
        LandingPage.joinWithEnterKey();
        chromeBrowser.waitForExist(LandingPage.loadedHomePageSelector, 5000);
      });

    it('should not allow user to login if the username is not specified (login using Enter key)',
      function () { // Chrome-only
        LandingPage.open();

        // we intentionally don't enter username here

        LandingPage.joinWithEnterKey();
        chromeBrowser.pause(5000); // amount of time we usually wait for the gome page to appear
        chai.expect(browser.getUrl().chromeBrowser).to.equal(LandingPage.url);
      });
});

