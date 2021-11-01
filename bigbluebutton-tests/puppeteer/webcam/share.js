const Page = require('../core/page');
const e = require('../core/elements');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants'); // core constants (Timeouts vars imported)

class Share extends Page {
  constructor() {
    super();
  }

  async test() {
    try {
      const parsedSettings = await this.getSettingsYaml();
      const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
      await this.shareWebcam(true, videoPreviewTimeout);

      return true;
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }

  async webcamLayoutStart() {
    try {
      await this.joinMicrophone();
      const parsedSettings = await this.getSettingsYaml();
      const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
      await this.shareWebcam(true, videoPreviewTimeout);
    } catch (err) {
      await this.logger(err);
    }
  }

  async webcamLayoutTest(testName) {
    try {
      await this.waitForSelector(e.webcamVideo, VIDEO_LOADING_WAIT_TIME);
      await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
      await this.waitForSelector(e.isTalking);
      const foundTestElement = await this.hasElement(e.webcamItemTalkingUser);
      if (foundTestElement === true) {
        await this.screenshot(`${testName}`, `success-${testName}`);
        this.logger(testName, ' passed');
        return true;
      } else if (foundTestElement === false) {
        await this.screenshot(`${testName}`, `fail-${testName}`);
        this.logger(testName, ' failed');
        return false;
      }
    } catch (err) {
      await this.logger(err);
      return false;
    }
  }
}

module.exports = exports = Share;
