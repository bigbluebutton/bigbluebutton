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

  //////////////////////////////
  // Userlist + Chat

  it('Userlist looks good', function() {
    HomePage.userListToggleButtonElement.click();
    utils.expectImageMatch(browser.checkElement(HomePage.userListContentSelector), 'Userlist content isn\'t the same');
  });

  it('Viewport looks good with userlist open', function() {
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we open userlist');
  });

  /*it('Userlist avatar looks good', function() {
    utils.expectImageMatch(browser.checkElement(HomePage.userAvatarElement), 'Userlist avatar isn\'t the same');
  });*/

  it('Public chat looks good', function() {
    HomePage.publicChatLinkElement.click();
    utils.expectImageMatch(browser.checkElement(HomePage.publicChatSelector), 'Public chat isn\'t the same');
  });

  it('Viewport looks good with both userlist and public chat open', function() {
    browser.moveToObject(HomePage.chatTitleSelector); // avoid hover effect on the Public Chat tab
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we open both userlist and public chat');
  });

  /*it('Public chat dropdown looks good', function() {
    HomePage.chatDropdownTriggerElement.click();
    utils.expectImageMatch(browser.checkElement(HomePage.publicChatSelector), 'Public chat dropdown isn\'t the same');
  });*/

  it('Public chat closes successfully', function() {
    HomePage.chatTitleElement.click();
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we closed public chat');
  });

  it('Userlist closes successfully', function() {
    HomePage.userListToggleButtonElement.click();
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we close the userlist');
  });

  //////////////////////////////
  // Settings:

  it('Settings dropdown looks good', function() {
    HomePage.settingsDropdownTriggerElement.waitForExist(2000);
    HomePage.settingsDropdownTriggerElement.click();
    HomePage.settingsDropdownElement.waitForExist(2000);
    browser.moveToObject(HomePage.settingsDropdownLogoutButtonSelector); // avoid Options tooltip
    utils.expectImageMatch(browser.checkElement(HomePage.settingsDropdownSelector), 'Settings dropdown isn\'t the same');
  });

  it('Logout popup looks good', function() {
    HomePage.settingsDropdownLogoutButtonElement.waitForExist(2000);
    HomePage.settingsDropdownLogoutButtonElement.click();
    HomePage.logoutModalElement.waitForExist(2000);
    utils.expectImageMatch(browser.checkElement(HomePage.logoutModalSelector));
  });

  it('Logout popup closes successfully', function() {
    HomePage.modalDismissButtonElement.click();
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we close Logout modal');
  });
});

