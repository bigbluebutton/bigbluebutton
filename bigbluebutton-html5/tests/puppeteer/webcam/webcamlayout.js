const util = require('./util');
const wle = require('./elements');
const Page = require('../core/page');

class WebcamLayout extends Page {
  constructor() {
    super('webcam-layout-test');
  }

  async share() {
    await this.joinMicrophone(this);
    await util.enableWebcam(this);
  }

  async test() {
    await this.page.waitForSelector(wle.webcamConnecting);
    await this.page.waitForSelector(wle.webcamVideo);
    return await this.page.evaluate(util.countTestElements, wle.webcamItemTalkingUser) !== 0;
  }
}
module.exports = exports = WebcamLayout;
