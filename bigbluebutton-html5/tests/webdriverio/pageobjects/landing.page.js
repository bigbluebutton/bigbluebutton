'use strict';

let Page = require('./page');
let pageObject = new Page();

class LandingPage extends Page {
  open() {
    super.open('demo/demoHTML5.jsp');
  }

  get title() {
    return 'Join Meeting via HTML5 Client';
  }

  get url() {
    return 'http://localhost:8080/demo/demoHTML5.jsp';
  }

  get username() {
    return $('input[name=username]');
  }

  get joinButton() {
    return $('input[type=submit]');
  }

  joinWithButtonClick() {
    this.joinButton.click();
  }

  joinWithEnterKey() {
    pageObject.pressEnter();
  }

  get loadedHomePage() {
    return $('#app');
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

