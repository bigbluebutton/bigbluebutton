const Share = require('./share');
const util = require('./util');

class Check extends Share {
  constructor() {
    super('check-webcam-content');
  }

  async test() {
    await util.startAndCheckForWebcams(this.page1);
    await util.startAndCheckForWebcams(this.page2);
    const responseUser1 = await util.webcamContentCheck(this.page1);
    const responseUser2 = await util.webcamContentCheck(this.page2);
    return responseUser1 && responseUser2;
  }
}
module.exports = exports = Check;
