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
    await this.joinWithMod2(testName);
  }

  // Check if User Joined in Breakoutrooms
  async testJoined(testName) {
    await this.modPage2.logger('Now executing: ', testName);
    try {
      if (testName === 'joinBreakoutroomsWithAudio') {
        await this.modPage2.logger('logged in to breakout with audio');

        const breakoutUserPage1 = await this.userPage1.getLastTargetPage();
        await breakoutUserPage1.bringToFront();

        // Talking indicator bar
        await breakoutUserPage1.waitForSelector(e.talkingIndicator);
        await breakoutUserPage1.screenshot(testName, '05-breakout-page02-user-joined-with-audio-before-check');

        await this.modPage2.logger('before pages check');

        const resp = await breakoutUserPage1.hasElement(e.isTalking);
        await breakoutUserPage1.screenshot(testName, '06-breakout-page02-user-joined-with-audio-after-check');

        await this.modPage2.logger('after pages check');
        return resp === true;
      } else if (testName === 'joinBreakoutroomsWithVideo') {
        await this.modPage2.logger('logged in to breakout with video');

        const breakoutUserPage1 = await this.userPage1.getLastTargetPage();
        await breakoutUserPage1.bringToFront();
        await breakoutUserPage1.screenshot(testName, '05-breakout-page02-user-joined-with-webcam-success');
        await this.modPage2.logger('before pages check');

        const resp = await breakoutUserPage1.hasElement(e.videoContainer, true, VIDEO_LOADING_WAIT_TIME);

        await breakoutUserPage1.screenshot(testName, '06-breakout-page02-user-joined-webcam-before-check');
        await this.modPage2.logger('after pages check');

        return resp === true;
      } else if (testName === 'joinBreakoutroomsAndShareScreen') {
        await this.modPage2.logger('logged in to breakout with screenshare');
        const breakoutUserPage1 = await this.userPage1.getLastTargetPage();
        await breakoutUserPage1.bringToFront();

        await breakoutUserPage1.screenshot(testName, '05-breakout-page02-user-joined-screenshare-before-check');
        await this.modPage2.logger('before pages check');
        const resp = await utilScreenShare.getScreenShareBreakoutContainer(breakoutUserPage1);

        await breakoutUserPage1.screenshot(testName, '06-breakout-page02-user-joined-screenshare-after-check');
        this.userPage1.logger('after pages check');

        return resp === true;
      } else {
        await this.userPage1.page.bringToFront();
        await this.userPage1.waitForSelector(e.breakoutRoomsItem);
        await this.userPage1.waitAndClick(e.chatButton);
        await this.userPage1.waitAndClick(e.breakoutRoomsItem);
        await this.userPage1.waitForSelector(e.alreadyConnected);

        return true;
      }
    } catch (err) {
      await this.modPage2.logger(err);
      return false;
    }
  }
}

module.exports = exports = Join;
