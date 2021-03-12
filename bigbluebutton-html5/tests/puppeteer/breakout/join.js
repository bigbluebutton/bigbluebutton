const path = require('path');
const moment = require('moment');
const Page = require('../core/page');
const Create = require('./create');
const util = require('./util');
const utilScreenShare = require('../screenshare/util');
const e = require('./elements');
const pe = require('../core/elements');
const we = require('../webcam/elements');
const ae = require('../audio/elements');
const { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)

const today = moment().format('DD-MM-YYYY');

class Join extends Create {
  constructor() {
    super('join-breakout');
  }

  // Join Existing Breakoutrooms
  async join(testName) {
    await this.joinWithUser3(testName);
  }

  // Check if User Joined in Breakoutrooms
  async testJoined(testName) {
    this.page3.logger('Now executing: ', testName);
    if (testName === 'joinBreakoutroomsWithAudio') {
      try {
        this.page3.logger('logged in to breakout with audio');

        const page2 = await this.page2.browser.pages();

        await page2[2].bringToFront();

        // Talking indicator bar
        await page2[2].waitForSelector(ae.talkingIndicator, { timeout: ELEMENT_WAIT_TIME });

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-audio-before-check-${testName}.png`) });
        }
        this.page3.logger('before pages check');

        const respTalkingIndicatorElement = await page2[2].evaluate(util.getTestElement, pe.isTalking);
        const resp = respTalkingIndicatorElement === true;

        if (process.env.GENERATE_EVIDENCES === 'true') {
          await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-with-audio-after-check-${testName}.png`) });
        }
        this.page3.logger('after pages check');
        return resp;
      } catch (e) {
        console.log(e);
      }
    } else if (testName === 'joinBreakoutroomsWithVideo') {
      this.page2.logger('logged in to breakout with video');

      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector(we.videoContainer, { timeout: VIDEO_LOADING_WAIT_TIME });
      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success-${testName}.png`) });
      }
      this.page2.logger('before pages check');

      const respWebcamElement = await page2[2].evaluate(util.getTestElement, we.videoContainer);
      const resp = respWebcamElement === true;

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-webcam-before-check-${testName}.png`) });
      }
      this.page2.logger('after pages check');
      return resp;
    } else if (testName === 'joinBreakoutroomsAndShareScreen') {
      this.page2.logger('logged in to breakout with screenshare');
      const page2 = await this.page2.browser.pages();
      const page3 = await this.page3.browser.pages();

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-screenshare-before-check-${testName}.png`) });
      }
      this.page2.logger('before pages check');
      const resp = await utilScreenShare.getScreenShareBreakoutContainer(page2[2]);

      if (process.env.GENERATE_EVIDENCES === 'true') {
        await page2[2].screenshot({ path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/06-breakout-page02-user-joined-screenshare-after-check-${testName}.png`) });
      }

      this.page2.logger('after pages check');
      return resp;
    } else {
      await this.page3.page.bringToFront();
      await this.page3.waitForSelector(e.breakoutRoomsItem, ELEMENT_WAIT_TIME);
      await this.page3.waitForSelector(e.chatButton, ELEMENT_WAIT_TIME);
      await this.page3.click(e.chatButton, true);
      await this.page3.click(e.breakoutRoomsItem, true);
      const resp = await this.page3.page.evaluate(async () => await document.querySelectorAll('span[class^="alreadyConnected--"]') !== null);
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
