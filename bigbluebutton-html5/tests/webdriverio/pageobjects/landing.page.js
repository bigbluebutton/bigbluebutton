'use strict';

let Page = require('./page');
let pageObject = new Page();
let chai = require('chai');

class LandingPage extends Page {
  open() {
    super.open('demo/demoHTML5.jsp');
  }

  get title() {
    return 'Join Meeting via HTML5 Client';
  }

  get url() {
    return `${browser.baseUrl}/demo/demoHTML5.jsp`;
  }

  // Username input field on the HTML5 client's landing page:

  get usernameInputSelector() {
    return 'input[name=username]';
  }

  get usernameInputElement() {
    return $(this.usernameInputSelector);
  }

  // Submit button on the HTML5 client's landing page:

  get joinButtonSelector() {
    return 'input[type=submit]';
  }

  get joinButtonElement() {
    return $(this.joinButtonSelector);
  }

  // Home page:

  get loadedHomePageSelector() {
    return '#app';
  }

  get loadedHomePageElement() {
    return $('#app');
  }

  //////////

  joinWithButtonClick() {
    this.joinButtonElement.click();
  }

  joinWithEnterKey() {
    pageObject.pressEnter();
  }
}

// To use in the future tests that will require login
browser.addCommand('loginToClient', function (page) {
  page.open();
  page.username.waitForExist();
  page.username.setValue('Maxim');
  page.joinWithButtonClick();
});

module.exports = new LandingPage();

