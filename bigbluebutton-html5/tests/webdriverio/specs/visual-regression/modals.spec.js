'use strict';

let HomePage = require('../../pageobjects/home.page');
var expect = require('chai').expect;

function expectImageMatch(results, errorMessage) {
  results.forEach((result) => expect(result.isExactSameImage, errorMessage).to.be.true);
}

describe('Screenshots:', function() {
  // browser.windowHandleSize({width: 1920, height: 1200});
  it('Join Audio modal looks good', function() {
    HomePage.login('testuser', 'Demo Meeting');
    browser.element('[data-test=audioModalHeader]').waitForExist(7000);
    expectImageMatch(browser.checkElement('.ReactModal__Content--after-open._imports_ui_components_audio_audio_modal__styles__modal'), 'Join Audio modal isn\'t the same');
  });

  it('Home page viewport looks good', function() {
    $('[data-test=modalBaseCloseButton]').click();
    expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same');
  });

  it('Settings dropdown looks good', function() {
    browser.element('[data-test=settingsDropdownTrigger]').waitForExist(2000);
    $('[data-test=settingsDropdownTrigger]').click();
    browser.element('[data-test=settingsDropdownTrigger] + [data-test=dropdownContent][aria-expanded="true"]').waitForExist(2000);
    expectImageMatch(browser.checkElement('[data-test=settingsDropdownTrigger] + [data-test=dropdownContent][aria-expanded="true"]'), 'Settings dropdown isn\'t the same');
  });

  it('Logout popup looks good', function() {
    browser.element('[data-test=settingsDropdownLogoutButton]').waitForExist(2000);
    $('[data-test=settingsDropdownLogoutButton]').click();
    browser.element('.ReactModal__Content--after-open._imports_ui_components_modal_fullscreen__styles__modal').waitForExist(2000);
    expectImageMatch(browser.checkElement('.ReactModal__Content--after-open._imports_ui_components_modal_fullscreen__styles__modal'));
  });

});

