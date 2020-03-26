const Page = require('../core/page');
const util = require('./util');

class Share extends Page{
  constructor() {
    super('webcam-test');
  }

  async test() {
    await util.enableWebcam(this.page);
    const response = await util.evaluateCheck(this.page);
    return response;
  }
}

module.exports = exports = Share;
