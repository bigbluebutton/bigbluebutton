const Page = require('../core/page');
const utilNotifications = require('../notifications/util');
const util = require('./util');
const e = require('../core/elements');

class ShareScreen extends Page {
  constructor() {
    super('share-screen');
  }

  async test() {
    await util.startScreenshare(this.page);

    await this.page.waitForSelector(e.screenShareVideo);
    const response = await util.getScreenShareContainer(this.page);
    return response;
  }

  async toast(page) {
    await util.startScreenshare(page);
    const response = await utilNotifications.getLastToastValue(page);
    return response;
  }
}

module.exports = exports = ShareScreen;
