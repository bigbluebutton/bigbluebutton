const Share = require('./share');
const util = require('./util');

class Check extends Share {
  constructor() {
    super('check-webcam-content');
  }

  async test() {
    const response1 = await util.startAndCheckForWebcams(this.page1);
    const response2 = await util.startAndCheckForWebcams(this.page2);
    const response = response1 && response2;
    return response;
  }
}
module.exports = exports = Check;
