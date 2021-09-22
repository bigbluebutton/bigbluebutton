const Create = require('./create');
const utilScreenShare = require('../screenshare/util');
const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)

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

        const breakoutPage2 = await this.page2.getLastTargetPage();
        await breakoutPage2.bringToFront();

        // Talking indicator bar
        await breakoutPage2.waitForSelector(e.talkingIndicator);
        await breakoutPage2.screenshot(testName, '05-breakout-page02-user-joined-with-audio-before-check');

        await this.page3.logger('before pages check');

        const resp = await breakoutPage2.hasElement(e.isTalking);
        await breakoutPage2.screenshot(testName, '06-breakout-page02-user-joined-with-audio-after-check');

        await this.page3.logger('after pages check');
        return resp === true;
      } else if (testName === 'joinBreakoutroomsWithVideo') {
        await this.page3.logger('logged in to breakout with video');

        const breakoutPage2 = await this.page2.getLastTargetPage();
        await breakoutPage2.bringToFront();
        await breakoutPage2.screenshot(testName, '05-breakout-page02-user-joined-with-webcam-success');
        await this.page3.logger('before pages check');

        // aqui
        const resp = await breakoutPage2.hasElement(e.videoContainer, true, VIDEO_LOADING_WAIT_TIME);

        await breakoutPage2.screenshot(testName, '06-breakout-page02-user-joined-webcam-before-check');
        await this.page3.logger('after pages check');

        return resp === true;
      } else if (testName === 'joinBreakoutroomsAndShareScreen') {
        await this.page3.logger('logged in to breakout with screenshare');
        const breakoutPage2 = await this.page2.getLastTargetPage();
        await breakoutPage2.bringToFront();

        await breakoutPage2.screenshot(testName, '05-breakout-page02-user-joined-screenshare-before-check');
        await this.page3.logger('before pages check');
        const resp = await utilScreenShare.getScreenShareBreakoutContainer(breakoutPage2);

        await breakoutPage2.screenshot(testName, '06-breakout-page02-user-joined-screenshare-after-check');
        this.page2.logger('after pages check');

        return resp === true;
      } else {
        await this.page2.page.bringToFront();
        await this.page2.waitForSelector(e.breakoutRoomsItem);
        await this.page2.waitAndClick(e.chatButton);
        await this.page2.waitAndClick(e.breakoutRoomsItem);
        await this.page2.waitForSelector(e.alreadyConnected);

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
