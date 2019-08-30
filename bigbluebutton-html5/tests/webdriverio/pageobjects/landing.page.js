
const chai = require('chai');
const sha1 = require('sha1');
const Page = require('./page');

const pageObject = new Page();

const WAIT_TIME = 10000;

const generateRandomMeetingId = function () {
  return `random-${Math.floor(1000000 + 9000000 * Math.random())}`;
};

const createMeeting = function () {
  const meetingId = generateRandomMeetingId();
  const query = `name=${meetingId}&meetingID=${meetingId}&attendeePW=ap`
    + '&moderatorPW=mp&joinViaHtml5=true&welcome=Welcome';
  const checksum = sha1(`create${query}${process.env.TESTING_SECRET}`);
  const url = `${process.env.TESTING_SERVER}create?${query}&checksum=${checksum}`;

  browser.url(url);
  browser.waitForExist('body', WAIT_TIME);
  chai.expect($('body').getText()).to.include('<returncode>SUCCESS</returncode>');

  return meetingId;
};

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

  joinMeeting(meetingId, fullName) {
    const query = `fullName=${fullName}&joinViaHtml5=true`
      + `&meetingID=${meetingId}&password=mp`;
    const checksum = sha1(`join${query}${process.env.TESTING_SECRET}`);
    const url = `${process.env.TESTING_SERVER}join?${query}&checksum=${checksum}`;
    browser.url(url);
  }

  // ////////

  joinClient(fullName) {
    const meetingId = createMeeting();
    this.joinMeeting(meetingId, fullName);
  }
}

module.exports = new LandingPage();
