const path = require('path');
const moment = require('moment');
const Create = require('./create');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { checkElement } = require('../core/util');
const { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)

const today = moment().format('DD-MM-YYYY');

class Join extends Create {
  constructor() {
    super();
  }

  // Join Existing Breakoutrooms
  async join(testName) {
    await this.joinWithUser3(testName);
  }

  // Check if User Joined in Breakoutrooms
  async testJoined(testName) {
    await this.page3.logger('Now executing: ', testName);
    try {
      if (testName === 'joinBreakoutroomsWithAudio') {
        await this.page3.logger('logged in to breakout with audio');

        const page2 = await this.page2.browser.pages();

        await page2[2].bringToFront();

        // Talking indicator bar
        await page2[2].waitForSelector(e.talkingIndicator, { timeout: ELEMENT_WAIT_TIME });

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-audio-before-check-${testName}.png`) });
        }
        await this.page3.logger('before pages check');

        const resp = await page2[2].evaluate(checkElement, e.isTalking);

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-with-audio-after-check-${testName}.png`) });
        }
        await this.page3.logger('after pages check');
        return resp === true;
      } else if (testName === 'joinBreakoutroomsWithVideo') {
        await this.page3.logger('logged in to breakout with video');

        const page2 = await this.page2.browser.pages();
        await page2[2].waitForSelector(e.videoContainer, { timeout: VIDEO_LOADING_WAIT_TIME });
        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success-${testName}.png`) });
        }
        await this.page3.logger('before pages check');

        const resp = await page2[2].evaluate(checkElement, e.videoContainer);

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-webcam-before-check-${testName}.png`) });
        }
        await this.page3.logger('after pages check');
        return resp === true;
      } else if (testName === 'joinBreakoutroomsAndShareScreen') {
        await this.page3.logger('logged in to breakout with screenshare');
        const page2 = await this.page2.browser.pages();
        const page3 = await this.page3.browser.pages();

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-screenshare-before-check-${testName}.png`) });
        }
        await this.page3.logger('before pages check');
        const resp = await utilScreenShare.getScreenShareBreakoutContainer(page2[2]);

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-screenshare-after-check-${testName}.png`) });
        }

        this.page2.logger('after pages check');
        return resp === true;
      } else {
        await this.page3.page.bringToFront();
        await this.page3.waitForSelector(e.breakoutRoomsItem);
        await this.page3.waitAndClick(e.chatButton);
        await this.page3.waitAndClick(e.breakoutRoomsItem);
        await this.page3.waitForSelector(e.alreadyConnected);

        return true;
      }
    } catch (err) {
      await this.page3.logger(err);
      return false;
    }
  }

  // Close pages
  async close() {
    try {
      await this.page1.close();
      await this.page2.close();
      await this.page3.close();
    } catch (err) {
      await this.page3.logger(err);
    }
  }
}

module.exports = exports = Join;
