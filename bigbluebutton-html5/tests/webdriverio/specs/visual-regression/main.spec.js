'use strict';

let HomePage = require('../../pageobjects/home.page');
let expect = require('chai').expect;
let utils = require('../../utils');

describe('Screenshots:', function() {
  it('Join Audio modal', function() {
    HomePage.login('testuser', 'Demo Meeting');
    HomePage.audioModalHeaderElement.waitForExist(7000);
    utils.expectImageMatch(browser.checkElement(HomePage.audioModalSelector), 'Join Audio modal isn\'t the same');
  });

  it('Home page viewport', function() {
    HomePage.modalBaseCloseButtonElement.click();
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same');
  });

  //////////////////////////////
  // Userlist + Chat

  it('Userlist', function() {
    HomePage.userListToggleButtonElement.click();
    utils.expectImageMatch(browser.checkElement(HomePage.userListContentSelector), 'Userlist content isn\'t the same');
  });

  it('Viewport with userlist open', function() {
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we open userlist');
  });

  /*it('Userlist avatar', function() {
    utils.expectImageMatch(browser.checkElement(HomePage.userAvatarElement), 'Userlist avatar isn\'t the same');
  });*/

  it('Public chat', function() {
    HomePage.publicChatLinkElement.click();
    utils.expectImageMatch(browser.checkElement(HomePage.publicChatSelector), 'Public chat isn\'t the same');
  });

  it('Viewport with both userlist and public chat open', function() {
    browser.moveToObject(HomePage.chatTitleSelector); // avoid hover effect on the Public Chat tab
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we open both userlist and public chat');
  });

  /*it('Public chat dropdown', function() {
    HomePage.chatDropdownTriggerElement.click();
    utils.expectImageMatch(browser.checkElement(HomePage.publicChatSelector), 'Public chat dropdown isn\'t the same');
  });*/

  it('Public chat closes', function() {
    HomePage.chatTitleElement.click();
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we closed public chat');
  });

  it('Userlist closes', function() {
    HomePage.userListToggleButtonElement.click();
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we close the userlist');
  });

  //////////////////////////////
  // Settings:

  it('Settings dropdown', function() {
    HomePage.settingsDropdownTriggerElement.waitForExist(2000);
    HomePage.settingsDropdownTriggerElement.click();
    HomePage.settingsDropdownElement.waitForExist(2000);
    browser.moveToObject(HomePage.settingsDropdownLogoutButtonSelector); // avoid Options tooltip
    utils.expectImageMatch(browser.checkElement(HomePage.settingsDropdownSelector), 'Settings dropdown isn\'t the same');
  });

  it('Logout popup', function() {
    HomePage.settingsDropdownLogoutButtonElement.waitForExist(2000);
    HomePage.settingsDropdownLogoutButtonElement.click();
    HomePage.logoutModalElement.waitForExist(2000);
    utils.expectImageMatch(browser.checkElement(HomePage.logoutModalSelector));
  });

  it('Logout popup closes', function() {
    HomePage.modalDismissButtonElement.click();
    utils.expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same after we close Logout modal');
  });
});

