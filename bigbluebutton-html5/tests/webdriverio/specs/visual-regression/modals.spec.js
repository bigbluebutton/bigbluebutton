'use strict';

let HomePage = require('../../pageobjects/home.page');
var expect = require('chai').expect;

function expectImageMatch(results, errorMessage) {
  results.forEach((result) => expect(result.isExactSameImage, errorMessage).to.be.true);
}

describe('Screenshots:', function() {

  it('Join Audio modal looks good', function() {
    HomePage.login('testuser', 'Demo Meeting');
    browser.element('.ReactModal__Content--after-open').waitForExist(7000);
    expectImageMatch(browser.checkElement('.ReactModal__Content--after-open'), 'Join Audio modal isn\'t the same');
  });

  it('Home page viewport looks good', function() {
    $('._imports_ui_components_audio_audio_modal__styles__closeBtn').click();
    expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same');
  });

  it('Settings dropdown looks good', function() {
    browser.element('.icon-bbb-more').waitForExist(2000);
    $('.icon-bbb-more').click();
    browser.element('._imports_ui_components_nav_bar__styles__right ._imports_ui_components_dropdown__styles__dropdown ._imports_ui_components_dropdown__styles__content[aria-expanded="true"]').waitForExist(2000);
    expectImageMatch(browser.checkElement('._imports_ui_components_nav_bar__styles__right ._imports_ui_components_dropdown__styles__dropdown ._imports_ui_components_dropdown__styles__content[aria-expanded="true"]'), 'Settings dropdown isn\'t the same');
  });

  it('Logout popup looks good', function() {
    browser.element('.icon-bbb-logout').waitForExist(2000);
    $('.icon-bbb-logout').click();
    browser.element('._imports_ui_components_modal_fullscreen__styles__modal').waitForExist(2000);
    expectImageMatch(browser.checkElement('._imports_ui_components_modal_fullscreen__styles__modal'));
  });

});

