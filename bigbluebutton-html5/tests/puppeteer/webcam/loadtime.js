const Share = require('./share');
const util = require('./util');

class LoadingTime extends Share {
  constructor() {
    super('check-webcam-loading-time');
  }

  async test() {
    await util.enableWebcam(this.page1);
    await util.enableWebcam(this.page2);
    const now = new Date().getMilliseconds();
    await util.waitForWebcamsLoading(this.page1);
    await util.waitForWebcamsLoading(this.page2);
    const end = new Date().getMilliseconds();
    return end - now;
  }
}
module.exports = exports = LoadingTime;
