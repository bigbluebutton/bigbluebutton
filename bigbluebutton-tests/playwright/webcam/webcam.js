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
    const { videoPreviewTimeout, skipVideoPreview, skipVideoPreviewOnFirstJoin } = this.settings;
    await this.shareWebcam(!(skipVideoPreview || skipVideoPreviewOnFirstJoin), videoPreviewTimeout);
    await this.hasElement('video');
    await this.hasElement(e.videoDropdownMenu);
    await this.waitAndClick(e.leaveVideo);
    await this.hasElement(e.joinVideo);
    await this.wasRemoved('video');
  }

  async checksContent() {
    const { videoPreviewTimeout, skipVideoPreview, skipVideoPreviewOnFirstJoin } = this.settings;
    await this.shareWebcam(!(skipVideoPreview || skipVideoPreviewOnFirstJoin), videoPreviewTimeout);
    const respUser = await webcamContentCheck(this);
    await expect(respUser).toBeTruthy();
  }

  async talkingIndicator() {
    await this.webcamLayoutStart();
    await this.waitForSelector(e.webcamContainer, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    await this.waitForSelector(e.isTalking);
    await this.hasElement(e.webcamItemTalkingUser);
  }

  async webcamLayoutStart() {
    await this.joinMicrophone();
    const { videoPreviewTimeout, skipVideoPreview, skipVideoPreviewOnFirstJoin } = this.settings;
    await this.shareWebcam(!(skipVideoPreview || skipVideoPreviewOnFirstJoin), videoPreviewTimeout);
  }
}

exports.Webcam = Webcam;
