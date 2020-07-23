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
    this.page3.logger('Now executing: ', testName);
    if (testName === 'joinBreakoutroomsWithAudio') {
      try {
        this.page3.logger('logged in to breakout with audio');

        const page2 = await this.page2.browser.pages();
        await page2[2].waitForSelector(pe.isTalking);
        await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-audio-before-check-${testName}.png`) });
        this.page3.logger('before pages check');

        const respTalkingIndicatorElement = await page2[2].evaluate(util.getTestElement, pe.isTalking);
        const resp = respTalkingIndicatorElement === true;

        await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-with-audio-after-check-${testName}.png`) });
        this.page3.logger('after pages check');
        return resp;
      } catch (e) {
        console.log(e);
      }
    } else if (testName === 'joinBreakoutroomsWithVideo') {
      this.page2.logger('logged in to breakout with video');

      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector(we.videoContainer);
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success-${testName}.png`) });
      this.page2.logger('before pages check');

      const respWebcamElement = await page2[2].evaluate(util.getTestElement, we.videoContainer);
      const resp = respWebcamElement === true;

      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-webcam-before-check-${testName}.png`) });
      this.page2.logger('after pages check');
      return resp;
    } else if (testName === 'joinBreakoutroomsAndShareScreen') {
      this.page2.logger('logged in to breakout with screenshare');

      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector(pe.screenShareVideo);
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-webcam-after-check-${testName}.png`) });
      this.page2.logger('before pages check');
      const resp = await page2[2].evaluate(async () => {
        const screenshareContainerElement = await document.querySelectorAll('video[id="screenshareVideo"]').length !== 0;
        return screenshareContainerElement === true;
      });
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-with-webcam-success-${testName}.png`) });
      this.page2.logger('after pages check');
      return resp;
    } else {
      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector(e.userJoined);
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-before-check-${testName}.png`) });
      const resp = await page2[2].evaluate(async () => {
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        return foundUserElement;
      });
      await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-after-check-${testName}.png`) });
      return resp;
    }
  }

  // Close pages
  async close() {
    await this.page1.close();
    await this.page2.close();
    await this.page3.close();
  }
}

module.exports = exports = Join;
