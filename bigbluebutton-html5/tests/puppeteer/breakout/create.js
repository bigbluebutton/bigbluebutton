const moment = require('moment');
const path = require('path');
const Page = require('../core/page');
const params = require('../params');
const util = require('./util');
const be = require('./elements'); // breakout elements
const we = require('../webcam/elements'); // webcam elements
const ae = require('../audio/elements'); // audio elements
const e = require('../core/elements'); // page base elements
// page elements
const today = moment().format('DD-MM-YYYY');

class Create {
  constructor() {
    this.page1 = new Page();
    this.page2 = new Page();
    this.page3 = new Page();
  }

  // Join BigBlueButton meeting
  async init(meetingId) {
    await this.page1.init(Page.getArgs(), meetingId, { ...params, fullName: 'Moderator1' }, undefined);
    await this.page2.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Viewer1', moderatorPW: '' }, undefined);
  }

  // Create Breakoutrooms
  async create(testName) {
    await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
    await this.page2.screenshot(`${testName}`, `01-page02-initialized-${testName}`);
    this.page1.logger('page01 initialized');
    this.page2.logger('page02 initialized');
    await this.page1.page.evaluate(util.clickTestElement, be.manageUsers);
    await this.page1.page.evaluate(util.clickTestElement, be.createBreakoutRooms);
    this.page1.logger('page01 breakout rooms menu loaded');
    await this.page1.screenshot(`${testName}`, `02-page01-creating-breakoutrooms-${testName}`);
    await this.page1.waitForSelector(be.randomlyAssign);
    await this.page1.page.evaluate(util.clickTestElement, be.randomlyAssign);
    this.page1.logger('page01 randomly assigned  users');
    await this.page1.screenshot(`${testName}`, `03-page01-randomly-assign-user-${testName}`);
    await this.page1.waitForSelector(be.modalConfirmButton);
    await this.page1.page.evaluate(util.clickTestElement, be.modalConfirmButton);
    this.page1.logger('page01 breakout rooms creation confirmed');
    await this.page1.screenshot(`${testName}`, `04-page01-confirm-breakoutrooms-creation-${testName}`);
    await this.page2.waitForSelector(be.modalConfirmButton);
    await this.page2.page.evaluate(util.clickTestElement, be.modalConfirmButton);
    this.page2.logger('page02 breakout rooms join confirmed');
    await this.page2.screenshot(`${testName}`, `02-page02-accept-invite-breakoutrooms-${testName}`);

    const page2 = await this.page2.browser.pages();
    this.page2.logger('before closing audio modal');
    await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/03-breakout-page02-before-closing-audio-modal.png`) });
    await this.page2.waitForBreakoutElement('button[aria-label="Close Join audio modal"]', 2);
    await this.page2.clickBreakoutElement('button[aria-label="Close Join audio modal"]', 2);
    await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/04-breakout-page02-after-closing-audio-modal.png`) });
    this.page2.logger('audio modal closed');
  }

  // Check if Breakoutrooms have been created
  async testCreatedBreakout(testName) {
    const resp = await this.page1.page.evaluate(() => document.querySelectorAll('div[data-test="breakoutRoomsItem"]').length !== 0);
    if (resp === true) {
      await this.page1.screenshot(`${testName}`, `05-page01-success-${testName}`);
      return true;
    }
    await this.page1.screenshot(`${testName}`, `05-page01-fail-${testName}`);
    return false;
  }

  // Initialize a Moderator session
  async joinWithUser3(testName) {
    if (testName === 'joinBreakoutroomsWithAudio') {
      await this.page3.init(Page.getArgsWithAudio(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      await this.page3.waitForSelector(be.alreadyConnected);

      const page3 = await this.page3.browser.pages();

      await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-no-mic-before-check-${testName}.png`) });
      await page3[2].waitForSelector(ae.microphone);
      await page3[2].click(ae.microphone);
      await page3[2].waitForSelector(ae.connectingStatus);
      await page3[2].waitForSelector(ae.audioAudible);
      await page3[2].click(ae.audioAudible);
      await page3[2].waitForSelector(e.whiteboard);

      await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-mic-before-check-${testName}.png`) });

      this.page3.logger('joined breakout with audio');
    } else if (testName === 'joinBreakoutroomsWithVideo') {
      await this.page3.init(Page.getArgsWithVideo(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      await this.page3.waitForSelector(be.alreadyConnected);

      const page3 = await this.page3.browser.pages();

      await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-no-webcam-before-check-${testName}.png`) });
      await page3[2].waitForSelector(e.audioDialog);
      await page3[2].waitForSelector(e.closeAudio);
      await page3[2].click(e.closeAudio);
      await page3[2].waitForSelector(we.joinVideo);
      await page3[2].click(we.joinVideo);
      await page3[2].waitForSelector(we.videoPreview);
      await page3[2].click(we.videoPreview);
      await page3[2].waitForSelector(we.startSharingWebcam);
      await page3[2].click(we.startSharingWebcam);
      await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-webcam-before-check-${testName}.png`) });

      this.page3.logger('joined breakout with video');
    } else if (testName === 'joinBreakoutroomsAndShareScreen') {
      await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      await this.page3.waitForSelector(be.alreadyConnected);
      const page3 = await this.page3.browser.pages();

      await page3[2].waitForSelector(e.audioDialog);
      await page3[2].waitForSelector(e.closeAudio);
      await page3[2].click(e.closeAudio);

      // Take Presenter
      await page3[2].waitForSelector('div[data-test="userListItemCurrent"]');
      await page3[2].click('div[data-test="userListItemCurrent"]');
      await page3[2].waitForSelector('li[data-test="setPresenter"]');
      await page3[2].click('li[data-test="setPresenter"]');

      // Start Share Screen
      await page3[2].waitForSelector('button[aria-label="Share your screen"]');
      await page3[2].click('button[aria-label="Share your screen"]');
      await page3[2].on('dialog', async (dialog) => {
        await dialog.accept();
      });

      this.page3.logger('joined breakout and started screen share');
    } else {
      await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      await this.page3.waitForSelector(be.alreadyConnected);

      this.page3.logger('joined breakout without use of any feature');
    }
  }

  // Close pages
  async close() {
    await this.page1.close();
    await this.page2.close();
  }
}

module.exports = exports = Create;
