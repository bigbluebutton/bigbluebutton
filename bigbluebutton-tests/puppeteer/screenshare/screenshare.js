const Page = require('../core/page');
const util = require('./util');
const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants');
const { checkElementLengthEqualTo } = require('../core/util');

class ShareScreen extends Page {
  constructor() {
    super('share-screen');
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

  async testMobileDevice(args, testName, deviceX) {
    try {
      await this.init(args, undefined, undefined, undefined, testName, undefined, deviceX);
      await this.startRecording(testName);
      await this.closeAudioModal();
      const screenshareBtn = await this.wasRemoved(e.startScreenSharing);
      return screenshareBtn;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = ShareScreen;
