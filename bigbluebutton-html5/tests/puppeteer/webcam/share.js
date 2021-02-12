const Page = require('../core/page');
const util = require('./util');
const wle = require('./elements');
const { ELEMENT_WAIT_TIME, VIDEO_LOADING_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)

class Share extends Page {
  constructor() {
    super('webcam-share-test');
  }

  async test() {
    const parsedSettings = await this.getSettingsYaml();
    const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
    const response = await util.enableWebcam(this, videoPreviewTimeout);
    return response;
  }

  async webcamLayoutStart() {
    await this.joinMicrophone();
    await util.enableWebcam(this);
  }

  async webcamLayoutTest() {
    await this.page.waitForSelector(wle.webcamConnecting, { timeout: ELEMENT_WAIT_TIME });
    await this.page.waitForSelector(wle.webcamVideo, { timeout: VIDEO_LOADING_WAIT_TIME });
    await this.page.waitForSelector(wle.stopSharingWebcam, { timeout: ELEMENT_WAIT_TIME });
    return await this.page.evaluate(util.countTestElements, wle.webcamItemTalkingUser) !== 0;
  }
}

module.exports = exports = Share;
