const Page = require('../core/page');
const params = require('../params');
const cpe = require('./elements');
const util = require('./util');
const c = require('./constants');

class CustomParameters {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
  }

  async autoJoin(args, meetingId, customParameter) {
    console.log('before init');
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter);
    console.log('after init');
    await this.page1.waitForSelector('div[class^="spinner--"]', { timeout: 5000 });
    console.log('after spinner');
    await this.page1.waitForSelector(cpe.whiteboard, { timeout: 5000 });
    const resp = await util.autoJoinTest(this.page1);
    console.log(resp, 'response');
    return resp;
  }

  async listenOnlyMode(args, meetingId, customParameter) {
    console.log('before init');
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter);
    await this.page2.init(args, this.page1.meetingId, { ...params, fullName: 'Attendee', moderatorPW: '' }, customParameter);
    console.log('after init');
    if (await this.page1.page.$('[data-test="audioModalHeader"]')) {
      return false;
    }
    await this.page1.page.waitFor(cpe.echoTestYesButton);
    await this.page2.page.waitFor(cpe.echoTestYesButton);
    const resp1 = await util.listenOnlyMode(this.page1);
    const resp2 = await util.listenOnlyMode(this.page2);
    console.log({ resp1, resp2 });
    return resp1 === true && resp2 === true;
  }

  async forceListenOnly(args, meetingId, customParameter) {
    console.log('before init');
    await this.page2.init(args, meetingId, { ...params, fullName: 'Attendee', moderatorPW: '' }, customParameter);
    console.log('after init');
    if (await this.page2.page.$('[data-test="audioModalHeader"]')) {
      return false;
    }
    await this.page2.page.waitFor(cpe.audioNotification);
    const resp = await util.forceListenOnly(this.page2);
    console.log(resp);
    return resp === true;
  }

  async skipCheck(args, meetingId, customParameter) {
    console.log('before init');
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter);
    console.log('after init');
    console.log('connecting with microphone');
    await this.page1.joinMicrophoneWithoutEchoTest();
    await this.page1.elementRemoved('div[class^="connecting--"]');
    console.log('before if condition');
    if (await this.page1.page.evaluate(util.countTestElements, cpe.echoTestYesButton) === true) {
      console.log('fail');
      return false;
    }
    console.log('before skipCheck');
    const resp = await this.page1.page.evaluate(util.countTestElements, cpe.echoTestYesButton) === false;
    console.log('after skipCheck');
    console.log(resp);
    return resp === true;
  }

  async clientTitle(args, meetingId, customParameter) {
    console.log('before init');
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter);
    console.log('after init');
    await this.page1.waitForSelector('button[aria-label="Microphone"]');
    if (await !(await this.page1.page.title()).includes(c.docTitle)) {
      console.log('fail');
      return false;
    }
    const resp = await (await this.page1.page.title()).includes(c.docTitle);
    console.log(resp);
    return resp === true;
  }

  async askForFeedbackOnLogout(args, meetingId, customParameter) {
    console.log('before init');
    await this.page1.init(args, meetingId, { ...params, fullName: 'Moderator' }, customParameter);
    console.log('after init');
    await this.page1.closeAudioModal();
    await this.page1.logoutFromMeeting();
    await this.page1.waitForSelector(cpe.meetingEndedModal);
    console.log('audio modal closed');
    if (await this.page1.page.evaluate(util.countTestElements, cpe.rating) === false) {
      console.log('fail');
      return false;
    }
    const resp = await this.page1.page.evaluate(util.countTestElements, cpe.rating) === true;
    console.log(resp);
    return resp === true;
  }

  async closePage(page) {
    page.close();
  }

  async close(page1, page2) {
    page1.close();
    page2.close();
  }
}

module.exports = exports = CustomParameters;
