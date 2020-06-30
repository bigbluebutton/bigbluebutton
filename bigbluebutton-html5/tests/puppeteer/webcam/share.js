const Page = require('../core/page');
const util = require('./util');

class Share extends Page {
  constructor() {
    super('webcam-share-test');
  }

  async test() {
    await util.enableWebcam(this);
    const response = await util.evaluateCheck(this);
    return response;
  }
}

module.exports = exports = Share;
