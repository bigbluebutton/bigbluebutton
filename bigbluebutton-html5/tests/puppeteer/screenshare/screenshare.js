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
    await util.startScreenshare(this.page);

    await this.page.waitForSelector(e.screenshareConnecting, ELEMENT_WAIT_TIME);
    await this.page.waitForSelector(e.screenShareVideo, VIDEO_LOADING_WAIT_TIME);
    await sleep(5000);
    const response = await util.getScreenShareContainer(this.page);
    return response;
  }
}

module.exports = exports = ShareScreen;
