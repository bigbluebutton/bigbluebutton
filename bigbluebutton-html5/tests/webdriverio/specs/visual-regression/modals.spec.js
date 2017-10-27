var expect = require('chai').expect;

function expectImageMatch(results, errorMessage) {
  results.forEach((result) => expect(result.isExactSameImage, errorMessage).to.be.true);
}

describe('Screenshots:', function() {

  it('Join Audio modal looks good', function() {
    browser.url('demo/demoHTML5.jsp?username=testuser&meetingname=Demo+Meeting&action=create');

    browser.element('.ReactModal__Content--after-open').waitForExist(7000);
    expectImageMatch(browser.checkElement('.ReactModal__Content--after-open'), 'Join Audio modal isn\'t the same');
  });

  it('Home page viewport looks good', function() {
    $('.icon-bbb-listen').click();
    browser.element('[aria-label="Unmute"]').waitForExist(5000);
    expectImageMatch(browser.checkViewport(), 'Home page viewport isn\'t the same');
  });

  it('Settings dropdown looks good', function() {
    browser.element('.icon-bbb-more').waitForExist(2000);
    $('.icon-bbb-more').click();
    browser.element('._imports_ui_components_nav_bar__styles__right ._imports_ui_components_dropdown__styles__dropdown ._imports_ui_components_dropdown__styles__content[aria-expanded="true"]').waitForExist(2000);
    expectImageMatch(browser.checkElement('._imports_ui_components_nav_bar__styles__right ._imports_ui_components_dropdown__styles__dropdown ._imports_ui_components_dropdown__styles__content[aria-expanded="true"]'), 'Settings dropdown isn\'t the same');
  });

  it('Logout popup looks good', function() {
    browser.element('._imports_ui_components_nav_bar__styles__right ._imports_ui_components_dropdown__styles__dropdown ._imports_ui_components_dropdown__styles__content[aria-expanded="true"] li[aria-labelledby="dropdown-item-label-7"]').waitForExist(2000);
    $('._imports_ui_components_nav_bar__styles__right ._imports_ui_components_dropdown__styles__dropdown ._imports_ui_components_dropdown__styles__content[aria-expanded="true"] li[aria-labelledby="dropdown-item-label-7"]').click();
    browser.element('._imports_ui_components_modal_fullscreen__styles__modal').waitForExist(2000);
    expectImageMatch(browser.checkElement('._imports_ui_components_modal_fullscreen__styles__modal'));
  });

});

