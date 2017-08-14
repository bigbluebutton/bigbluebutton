'use strict';

let LandingPage = require('../pageobjects/landing.page');
let chai = require('chai');

describe('Landing page', function () {

  it('should have correct title', function () {
    LandingPage.open();

    chai.expect(chromeBrowser.getTitle()).to.equal(LandingPage.title);
    chai.expect(firefoxBrowser.getTitle()).to.equal(LandingPage.title);
  });

  it('should allow user to login if the username is specified and the Join button is clicked',
    function () {
      chromeBrowser.windowHandleSize({width: 1000, height: 600});
      chromeBrowser.windowHandlePosition({x: 0, y: 650});

      firefoxBrowser.windowHandleSize({width: 1000, height: 600});
      firefoxBrowser.windowHandlePosition({x: 0, y: 0});

      //////////

      LandingPage.open();
      //LandingPage.usernameInputElement.waitForExist();

      chromeBrowser.setValue(LandingPage.usernameInputSelector, 'Maxim');
      firefoxBrowser.setValue(LandingPage.usernameInputSelector, 'Anton');

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
      chai.expect(browser.getUrl().chromeBrowser).to.equal(LandingPage.url);
      chai.expect(browser.getUrl().firefoxBrowser).to.equal(LandingPage.url);
    });

    it('should allow user to login if the username is specified and then Enter key is pressed',
      function () {
        LandingPage.open();

        chromeBrowser.setValue(LandingPage.usernameInputSelector, 'Maxim');
        firefoxBrowser.setValue(LandingPage.usernameInputSelector, 'Anton');
        LandingPage.joinWithEnterKey();
        chromeBrowser.waitForExist(LandingPage.loadedHomePageSelector, 5000);
      });

    it('should not allow user to login if the username is not specified (login using Enter key)',
      function () {
        LandingPage.open();

        // we intentionally don't enter username here

        LandingPage.joinWithEnterKey();
        chromeBrowser.pause(5000); // amount of time we usually wait for the gome page to appear
        chai.expect(browser.getUrl().chromeBrowser).to.equal(LandingPage.url);
      });
});

