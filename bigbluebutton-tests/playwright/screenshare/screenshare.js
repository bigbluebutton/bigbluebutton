const Page = require('../core/page');
const util = require('./util');
const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants');

class ShareScreen extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async startSharing() {
    await util.startScreenshare(this);
    await util.getScreenShareBreakoutContainer(this);
    await this.hasElement(e.isSharingScreen);
  }

  async testMobileDevice() {
    await this.wasRemoved(e.startScreenSharing);
  }
}

module.exports = exports = ShareScreen;