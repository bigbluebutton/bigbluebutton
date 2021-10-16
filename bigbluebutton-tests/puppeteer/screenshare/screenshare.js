const Page = require('../core/page');
const util = require('./util');
const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants');

class ShareScreen extends Page {
  constructor() {
    super();
  }

  async test() {
    try {
      await util.startScreenshare(this);
      await this.waitForSelector(e.screenshareConnecting);
      await this.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
      const response = await this.hasElement(e.isSharingScreen, true);

      return response === true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async testMobileDevice(testName, deviceX) {
    try {
      await this.init(true, true, testName, undefined, undefined, undefined, undefined, deviceX);
      await this.startRecording(testName);
      return this.wasRemoved(e.startScreenSharing);
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = ShareScreen;