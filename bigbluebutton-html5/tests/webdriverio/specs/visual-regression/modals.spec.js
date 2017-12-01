'use strict';

let HomePage = require('../../pageobjects/home.page');
let expect = require('chai').expect;
let utils = require('../../utils');

describe('Screenshots:', function() {
  it('Join Audio modal looks good', function() {
    HomePage.login('testuser', 'Demo Meeting');
    HomePage.audioModalHeaderElement.waitForExist(7000);
    utils.expectImageMatch(browser.checkElement(HomePage.audioModalSelector), 'Join Audio modal isn\'t the same');
  });

  it('Home page viewport looks good', function() {
    HomePage.modalBaseCloseButtonElement.click();
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same');
  });

  it('Settings dropdown looks good', function() {
    HomePage.settingsDropdownTriggerElement.waitForExist(2000);
    HomePage.settingsDropdownTriggerElement.click();
    HomePage.settingsDropdownElement.waitForExist(2000);
    utils.expectImageMatch(browser.checkElement(HomePage.settingsDropdownSelector), 'Settings dropdown isn\'t the same');
  });

  it('Logout popup looks good', function() {
    HomePage.settingsDropdownLogoutButtonElement.waitForExist(2000);
    HomePage.settingsDropdownLogoutButtonElement.click();
    HomePage.logoutModalElement.waitForExist(2000);
    utils.expectImageMatch(browser.checkElement(HomePage.logoutModalSelector));
  });

});

