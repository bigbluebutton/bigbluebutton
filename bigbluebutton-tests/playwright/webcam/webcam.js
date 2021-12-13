const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { webcamContentCheck } = require('./util');
const { VIDEO_LOADING_WAIT_TIME } = require('../core/constants');

class Webcam extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async share() {
    const parsedSettings = await this.getSettingsYaml();
    const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
    await this.shareWebcam(true, videoPreviewTimeout);

    await this.hasElement('video');
  }

  async checksContent() {
    const parsedSettings = await this.getSettingsYaml();
    const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);

    await this.shareWebcam(true, videoPreviewTimeout);
    const respUser = await webcamContentCheck(this);

    await expect(respUser).toBeTruthy();
  }

  async talkingIndicator() {
    await this.webcamLayoutStart();

    await this.waitForSelector(e.webcamVideo, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.isTalking);
    await this.hasElement(e.webcamItemTalkingUser);
  }

  async webcamLayoutStart() {
    await this.joinMicrophone();
    const parsedSettings = await this.getSettingsYaml();
    const videoPreviewTimeout = parseInt(parsedSettings.public.kurento.gUMTimeout);
    await this.shareWebcam(true, videoPreviewTimeout);
  }
}

exports.Webcam = Webcam;
