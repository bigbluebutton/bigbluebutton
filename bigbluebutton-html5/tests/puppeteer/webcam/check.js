const Share = require('./share');
const util = require('./util');

class Check extends Share {
  constructor() {
    super('check-webcam-content');
  }

  async test() {
    await util.enableWebcam(this.page1);
    const respUser = await util.webcamContentCheck(this.page1);
    return respUser === true;
  }
}
module.exports = exports = Check;
