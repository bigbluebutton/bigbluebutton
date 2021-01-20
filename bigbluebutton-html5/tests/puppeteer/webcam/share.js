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
    await this.page.waitForSelector(wle.webcamConnecting);
    await this.page.waitForSelector(wle.webcamVideo);
    return await this.page.evaluate(util.countTestElements, wle.webcamItemTalkingUser) !== 0;
  }

  async test() {
    await util.enableWebcam(this);
    const response = await util.evaluateCheck(this);
    return response;
  }
}

module.exports = exports = Share;
