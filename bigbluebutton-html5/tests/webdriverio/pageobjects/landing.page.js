

const Page = require('./page');

const pageObject = new Page();
const chai = require('chai');

class LandingPage extends Page {
  get meetingNameInputSelector() {
    return 'input[name=meetingname]';
  }

  get meetingNameInputElement() {
    return $(this.meetingNameInputSelector);
  }

  // ////////

  get usernameInputSelector() {
    return 'input[name=username]';
  }

  get usernameInputElement() {
    return $(this.usernameInputSelector);
  }

  // ////////

  joinWithButtonClick() {
    this.joinButtonElement.click();
  }

  joinWithEnterKey() {
    pageObject.pressEnter();
  }

  // ////////

  get joinButtonSelector() {
    return 'input[type=submit]';
  }

  get joinButtonElement() {
    return $(this.joinButtonSelector);
  }

  // ////////

  open() {
    super.open('demo/demoHTML5.jsp');
  }
}

module.exports = new LandingPage();
