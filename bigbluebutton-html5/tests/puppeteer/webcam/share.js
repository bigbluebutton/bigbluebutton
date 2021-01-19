const Page = require('../core/page');
const util = require('./util');
const wle = require('./elements');

class Share extends Page {
  constructor() {
    super('webcam-share-test');
  }

  async webcamLayoutStart() {
    await this.joinMicrophone();
    await util.enableWebcam(this);
  }

  async webcamLayoutTest() {
    await this.page.waitForSelector(wle.webcamConnecting, { timeout: 5000 });
    await this.page.waitForSelector(wle.webcamVideo, { timeout: 15000 });
    await this.page.waitForSelector(wle.stopSharingWebcam, { timeout: 5000 });
    return await this.page.evaluate(util.countTestElements, wle.webcamItemTalkingUser) !== 0;
  }
}

module.exports = exports = Share;
