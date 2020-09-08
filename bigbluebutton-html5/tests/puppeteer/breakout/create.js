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
    await this.page1.closeAudioModal();
    await this.page2.closeAudioModal();
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.page1.screenshot(`${testName}`, `01-page01-initialized-${testName}`);
      await this.page2.screenshot(`${testName}`, `01-page02-initialized-${testName}`);
    }
    await this.page1.page.evaluate(util.clickTestElement, be.manageUsers);
    await this.page1.page.evaluate(util.clickTestElement, be.createBreakoutRooms);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.page1.screenshot(`${testName}`, `02-page01-creating-breakoutrooms-${testName}`);
    }
    await this.page1.waitForSelector(be.randomlyAssign);
    await this.page1.page.evaluate(util.clickTestElement, be.randomlyAssign);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.page1.screenshot(`${testName}`, `03-page01-randomly-assign-user-${testName}`);
    }
    await this.page1.waitForSelector(be.modalConfirmButton);
    await this.page1.page.evaluate(util.clickTestElement, be.modalConfirmButton);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.page1.screenshot(`${testName}`, `04-page01-confirm-breakoutrooms-creation-${testName}`);
    }
    await this.page2.waitForSelector(be.modalConfirmButton);
    await this.page2.page.evaluate(util.clickTestElement, be.modalConfirmButton);
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.page2.screenshot(`${testName}`, `02-page02-accept-invite-breakoutrooms-${testName}`);
    }
    await this.page2.page.bringToFront();
    await this.page2.waitForSelector(be.breakoutRoomsItem);
    await this.page2.waitForSelector(be.chatButton);
    await this.page2.click(be.chatButton);
    await this.page2.click(be.breakoutRoomsItem);
    await this.page2.waitForSelector(be.alreadyConnected);
    const page2 = await this.page2.browser.pages();
    await page2[2].bringToFront();
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/03-breakout-page02-before-closing-audio-modal.png`) });
    }
    await page2[2].waitForSelector('button[aria-label="Close Join audio modal"]');
    await page2[2].click('button[aria-label="Close Join audio modal"]');
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/04-breakout-page02-after-closing-audio-modal.png`) });
    }
  }

  // Check if Breakoutrooms have been created
  async testCreatedBreakout(testName) {
    const resp = await this.page1.page.evaluate(() => document.querySelectorAll('div[data-test="breakoutRoomsItem"]').length !== 0);
    if (resp === true) {
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await this.page1.screenshot(`${testName}`, `05-page01-success-${testName}`);
      }
      return true;
    }
    if (process.env.GENERATE_EVIDENCES === 'true') {
      await this.page1.screenshot(`${testName}`, `05-page01-fail-${testName}`);
    }
    return false;
  }

  // Initialize a Moderator session
  async joinWithUser3(testName) {
    if (testName === 'joinBreakoutroomsWithAudio') {
      await this.page3.init(Page.getArgsWithAudio(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);

      await this.page3.waitForSelector(be.breakoutRoomsItem);
      await this.page3.waitForSelector(be.chatButton);
      await this.page3.click(be.chatButton);
      await this.page3.click(be.breakoutRoomsItem);


      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      await this.page3.waitForSelector(be.alreadyConnected);

      const page3 = await this.page3.browser.pages();

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-no-mic-before-check-${testName}.png`) });
      }
      await page3[2].bringToFront();
      await page3[2].waitForSelector(ae.microphone);
      await page3[2].click(ae.microphone);
      await page3[2].waitForSelector(ae.connectingStatus);
      await page3[2].waitForSelector(ae.audioAudible);
      await page3[2].click(ae.audioAudible);
      await page3[2].waitForSelector(e.whiteboard);

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-mic-before-check-${testName}.png`) });
      }
    } else if (testName === 'joinBreakoutroomsWithVideo') {
      await this.page3.init(Page.getArgsWithVideo(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      await this.page3.waitForSelector(be.alreadyConnected);

      const page3 = await this.page3.browser.pages();

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-no-webcam-before-check-${testName}.png`) });
      }
      await page3[2].bringToFront();
      await page3[2].waitForSelector(e.audioDialog);
      await page3[2].waitForSelector(e.closeAudio);
      await page3[2].click(e.closeAudio);
      await page3[2].waitForSelector(we.joinVideo);
      await page3[2].click(we.joinVideo);
      await page3[2].waitForSelector(we.videoPreview);
      await page3[2].click(we.videoPreview);
      await page3[2].waitForSelector(we.startSharingWebcam);
      await page3[2].click(we.startSharingWebcam);
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-webcam-before-check-${testName}.png`) });
      }
    } else if (testName === 'joinBreakoutroomsAndShareScreen') {
      await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
      await this.page3.waitForSelector(be.breakoutRoomsButton);
      await this.page3.click(be.breakoutRoomsButton, true);
      await this.page3.waitForSelector(be.joinRoom1);
      await this.page3.click(be.joinRoom1, true);
      await this.page3.waitForSelector(be.alreadyConnected);
      const page3 = await this.page3.browser.pages();

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-screenshare-before-check-${testName}.png`) });
      }
      await page3[2].bringToFront();
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
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page3[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/00-breakout-page03-user-joined-with-screenshare-after-check-${testName}.png`) });
      }
    } else {
      await this.page3.init(Page.getArgs(), this.page1.meetingId, { ...params, fullName: 'Moderator3' }, undefined);
      await this.page3.closeAudioModal();
    }
  }

  // Close pages
  async close() {
    await this.page1.close();
    await this.page2.close();
  }
}

module.exports = exports = Create;
