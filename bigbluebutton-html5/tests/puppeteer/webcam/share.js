const Page = require('../core/page');
const util = require('./util');
const we = require('./elements');

class Share extends Page {
  constructor() {
    super('share-webcam');
  }

  async test() {
    await util.enableWebcam(this.page);
    await this.waitForSelector(we.videoContainer);
    const videoContainer = await this.page.evaluate(util.getTestElement, we.videoContainer);
    const response = videoContainer !== null;
    return response;
  }
}

module.exports = exports = Share;
