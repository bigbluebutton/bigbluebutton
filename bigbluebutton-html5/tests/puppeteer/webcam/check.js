const Share = require('./share');
const util = require('./util');

class Check extends Share {
  constructor() {
    super('webcam-check-content-test');
  }

  async test() {
    await util.enableWebcam(this);
    const respUser = await util.webcamContentCheck(this);
    return respUser === true;
  }
}
module.exports = exports = Check;
