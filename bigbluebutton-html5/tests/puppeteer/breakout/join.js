const Page = require('../core/page');
const Create = require('./create');
const util = require('./util');
const e = require('./elements');
const pe = require('../core/elements');
const we = require('../webcam/elements');
const moment = require('moment');
const today = moment().format('DD-MM-YYYY');

class Join extends Create {
  constructor() {
    super('join-breakout');
  }

  // Join Existing Breakoutrooms
  async join(testName) {
    if(testName === 'joinBreakoutroomsWithAudio') {
      await this.joinWithUser3(testName);
    } else if (testName === 'joinBreakoutroomsWithVideo'){
      await this.joinWithUser3(testName);
    } else {
      await this.joinWithUser3(testName);
    };

    await this.page3.screenshot(`${testName}`, `01-page03-initialized-${testName}`);
    await this.page3.closeAudioModal();
    await this.page3.screenshot(`${testName}`, `02-page03-closed-audioModal-${testName}`);
    await this.page3.waitForSelector(e.breakoutRoomsItem);
    await this.page3.page.evaluate(util.clickTestElement, e.breakoutRoomsItem);
    await this.page3.screenshot(`${testName}`, `03-page03-breakoutrooms-list-visualization-${testName}`);
    await this.page3.waitForSelector(e.breakoutJoin);
    await this.page3.page.evaluate(util.clickTestElement, e.breakoutJoin);
    await this.page3.screenshot(`${testName}`, `04-page03-joined-breakoutrooms-${testName}`);
  }

  // Check if User Joined in Breakoutrooms
  async testJoined(testName) {
    console.log(testName);
    if(testName == 'joinBreakoutroomsWithAudio') {
      this.page2.logger('before pages check');
      const page2 = await this.page2.browser.pages();
      await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      await page2[2].waitForSelector('[data-test="isTalking"]');
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-audio-success.png`)});
      this.page2.logger('after pages check');
      // await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      // await page2[2].waitForSelector('[data-test="isTalking"]');
      const resp = await page3[2].evaluate(async ()=>{
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        const foundTalkingIndicatorElement = await document.querySelectorAll('[data-test="isTalking"]').length !== 0;
        return foundUserElement && foundTalkingIndicatorElement;
      });
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-audio-success.png`)});
      this.page2.logger('after pages check');
      return resp;
    } else if(testName == 'joinBreakoutroomsWithVideo') {
      this.page2.logger('before pages check');
      const page2 = await this.page2.browser.pages();
      // await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      // await page2[2].waitForSelector('div[class^="videoListItem"]');
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success.png`)});
      this.page2.logger('after pages check');
      const resp = await page3[2].evaluate(async ()=>{
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        const webcamContainerElement = await document.querySelectorAll('div[class^="videoListItem"]').length !== 0;
        return foundUserElement && webcamContainerElement;
      });
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success.png`)});
      this.page2.logger('after pages check');
      return resp;
    } else if (testName === 'joinBreakoutroomsAndShareScreen') {
      this.page2.logger('before pages check');
      const page2 = await this.page2.browser.pages();
      // await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      // await page2[2].waitForSelector('div[class^="videoListItem"]');
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success.png`)});
      this.page2.logger('after pages check');
      const resp = await page3[2].evaluate(async ()=>{
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        const screenshareContainerElement = await document.querySelectorAll('video[id="screenshareVideo"]').length !== 0;
        const screenshareButton = await document.querySelectorAll('button[aria-label="Stop sharing your screen"]').length !== 0;
        return foundUserElement && screenshareContainerElement && screenshareButton;
      });
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-with-webcam-success.png`)});
      this.page2.logger('after pages check');
      return resp;
    } else {
      const page2 = await this.page2.browser.pages();
      // await page2[2].waitForSelector('div[aria-label^="Moderator3"]');
      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-success.png`)});
      const resp = await page3[2].evaluate(async ()=>{
        const foundUserElement = await document.querySelectorAll('div[aria-label^="Moderator3"]').length !== 0;
        return foundUserElement;
      });

      await page2[2].screenshot({path: path.join(__dirname, `../${process.env.TEST_FOLDER}/test-${today}-${testName}/screenshots/05-breakout-page02-user-joined-success.png`)});
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
