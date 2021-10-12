const Page = require('../core/page');
const util = require('./util');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } = require('../core/constants');
const { sleep } = require('../core/helper');

class ShareScreen extends Page {
  constructor() {
    super('share-screen');
  }

  async test() {
    try {
      await util.startScreenshare(this);
      await this.page.waitForSelector(e.screenshareConnecting, ELEMENT_WAIT_TIME);
      await this.page.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
      await sleep(5000);
      const response = await util.getScreenShareContainer(this);
      return response;
    } catch (e) {
      console.log(e);
      return false;
    }
  }

  async testMobileDevice(args, testName, deviceX) {
    await this.init(args, undefined, undefined, undefined, testName, undefined, deviceX);
    await this.startRecording(testName);
    await this.closeAudioModal();
    try {
      const screenshareBtn = await this.page.evaluate(() => document.querySelectorAll('button[aria-label="Share your screen"]').length === 0) === true;
      return screenshareBtn;
    } catch (e) {
      console.log(e);
      return false;
    }
  }
}

module.exports = exports = ShareScreen;
