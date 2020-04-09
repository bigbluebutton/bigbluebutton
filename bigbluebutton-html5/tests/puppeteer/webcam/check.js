const Share = require('./share');
const util = require('./util');

class Check extends Share {
  constructor() {
    super('check-webcam-content');
  }

  async test() {
    await util.enableWebcam(this.page);
    const respUser = await util.webcamContentCheck(this.page);
    return respUser === true;
  }
}
module.exports = exports = Check;
