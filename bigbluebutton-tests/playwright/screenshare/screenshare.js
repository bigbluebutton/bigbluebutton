const Page = require('../core/page');
const { startScreenshare, getScreenShareBreakoutContainer } = require('./util');
const e = require('../core/elements');

class ScreenShare extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async startSharing() {
    await startScreenshare(this);
    await getScreenShareBreakoutContainer(this);
    await this.hasElement(e.isSharingScreen);
  }

  async testMobileDevice() {
    await this.wasRemoved(e.startScreenSharing);
  }
}

exports.ScreenShare = ScreenShare;
