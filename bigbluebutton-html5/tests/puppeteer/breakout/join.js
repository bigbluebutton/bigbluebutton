const path = require('path');
const moment = require('moment');
const Page = require('../core/page');
const Create = require('./create');
const util = require('./util');
const e = require('./elements');
const pe = require('../core/elements');
const we = require('../webcam/elements');

const today = moment().format('DD-MM-YYYY');

class Join extends Create {
  constructor() {
    super('join-breakout');
  }

  // Join Existing Breakoutrooms
  async join(testName) {
    if (testName === 'joinBreakoutroomsWithAudio') {
      await this.joinWithUser3(testName);
    } else if (testName === 'joinBreakoutroomsWithVideo') {
      await this.joinWithUser3(testName);
    } else if (testName === 'joinBreakoutroomsAndShareScreen') {
      await this.joinWithUser3(testName);
    } else {
      await this.joinWithUser3(testName);
    }
  }

  // Check if User Joined in Breakoutrooms
  async testJoined(testName) {
    console.log(testName);
    if (testName === 'joinBreakoutroomsWithAudio') {
      this.page2.logger('logged in to breakout with audio');
      const page2 = await this.page2.browser.pages();
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-before-waiting-for-elements.png`) });
      await page2[2].waitForSelector(e.userJoined);
      await page2[2].waitForSelector(pe.isTalking);
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-audio-before-check.png`) });
      this.page2.logger('before pages check');
      const resp = await page2[2].evaluate(async () => {
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        const foundTalkingIndicatorElement = await document.querySelectorAll('[data-test="isTalking"]').length !== 0;
        return foundUserElement === true && foundTalkingIndicatorElement === true;
      });
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-with-audio-after-check.png`) });
      this.page2.logger('after pages check');
      return resp;
    } if (testName === 'joinBreakoutroomsWithVideo') {
      this.page2.logger('logged in to breakout with video');
      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector(e.userJoined);
      await page2[2].waitForSelector(we.videoContainer);
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success.png`) });
      this.page2.logger('before pages check');
      const resp = await page2[2].evaluate(async () => {
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        const webcamContainerElement = await document.querySelectorAll('div[class^="videoListItem"]').length !== 0;
        return foundUserElement === true && webcamContainerElement === true;
      });
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-webcam-before-check.png`) });
      this.page2.logger('after pages check');
      return resp;
    } if (testName === 'joinBreakoutroomsAndShareScreen') {
      this.page2.logger('logged in to breakout with screenshare');
      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector(e.userJoined);
      await page2[2].waitForSelector(pe.screenShareVideo);
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-webcam-after-check.png`) });
      this.page2.logger('before pages check');
      const resp = await page2[2].evaluate(async () => {
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        const screenshareContainerElement = await document.querySelectorAll('video[id="screenshareVideo"]').length !== 0;
        return foundUserElement === true && screenshareContainerElement === true;
      });
      console.log({ resp });
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-with-webcam-success.png`) });
      this.page2.logger('after pages check');
      return resp;
    }
    const page2 = await this.page2.browser.pages();
    await page2[2].waitForSelector(e.userJoined);
    await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-before-check.png`) });
    const resp = await page2[2].evaluate(async () => {
      const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
      return foundUserElement;
    });

    await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-after-check.png`) });
    return resp;
  }

  // Close pages
  async close() {
    await this.page1.close();
    await this.page2.close();
    await this.page3.close();
  }
}

module.exports = exports = Join;
