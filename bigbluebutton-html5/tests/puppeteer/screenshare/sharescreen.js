const Page = require('../core/page');
const util = require('./util');
const e = require('../core/elements');

class ShareScreen extends Page {
  constructor() {
    super('share-screen');
  }

  async test() {
    await util.startScreenshare(this.page);
    this.page.on('dialog', async (dialog) => {
      await dialog.accept();
    });
    await this.page.waitForSelector(e.screenShareVideo);
    const response = await util.getScreenShareContainer(this.page);
    return response;
  }
}

module.exports = exports = ShareScreen;
