const { expect } = require('@playwright/test');
const Page = require('../core/page');
const e = require('../core/elements');
const { checkVideoUploadData, uploadBackgroundVideoImage, webcamContentCheck } = require('./util');
const { VIDEO_LOADING_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { sleep } = require('../core/helpers');

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
    await this.waitForSelector(e.webcamVideoItem);
    await this.wasRemoved(e.webcamConnecting, ELEMENT_WAIT_LONGER_TIME);
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

  async changeVideoQuality() {
    const { videoPreviewTimeout } = this.settings;

    const joinWebcamSettingQuality = async (value) => {
      await this.waitAndClick(e.joinVideo);
      await this.waitForSelector(e.videoQualitySelector);
      const langDropdown = await this.page.$(e.videoQualitySelector);
      await langDropdown.selectOption({ value });
      await this.waitForSelector(e.videoPreview, videoPreviewTimeout);
      await this.waitAndClick(e.startSharingWebcam);
      await this.waitForSelector(e.webcamConnecting);
      await this.waitForSelector(e.leaveVideo, VIDEO_LOADING_WAIT_TIME);
    }

    await joinWebcamSettingQuality('low');
    await this.waitAndClick(e.connectionStatusBtn);
    const lowValue = await checkVideoUploadData(this, 0);
    await this.waitAndClick(e.closeModal);
    await this.waitAndClick(e.leaveVideo);
    await joinWebcamSettingQuality('high');
    await this.waitAndClick(e.connectionStatusBtn);
    await checkVideoUploadData(this, lowValue);
  }

  async applyBackground() {
    await this.waitAndClick(e.joinVideo);
    await this.waitForSelector(e.noneBackgroundButton);
    await this.waitAndClick(`${e.selectDefaultBackground}[aria-label="Home"]`);
    await sleep(1000);
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.webcamContainer);
    const webcamVideoLocator = await this.getLocator(e.webcamContainer);
    await expect(webcamVideoLocator).toHaveScreenshot('webcam-with-home-background.png', {
      maxDiffPixelRatio: 0.1,
    });
  }

  async managingNewBackground() {
    await this.waitAndClick(e.joinVideo);
    await this.waitForSelector(e.noneBackgroundButton);

    // Upload
    await uploadBackgroundVideoImage(this);

    // Apply
    await this.waitAndClick(e.selectCustomBackground);
    await sleep(1000);
    await this.waitAndClick(e.startSharingWebcam);
    await this.waitForSelector(e.webcamContainer);
    const webcamVideoLocator = await this.getLocator(e.webcamContainer);
    await expect(webcamVideoLocator).toHaveScreenshot('webcam-with-new-background.png', {
      maxDiffPixelRatio: 0.1,
    });

    // Remove
    await this.waitAndClick(e.videoDropdownMenu);
    await this.waitAndClick(e.advancedVideoSettingsBtn);
    await this.waitAndClick(e.removeCustomBackground);
    await this.wasRemoved(e.selectCustomBackground);
  }

  async keepScreenshotWhenRejoin(context) {
    await this.waitAndClick(e.joinVideo);
    await this.waitForSelector(e.noneBackgroundButton);
    await uploadBackgroundVideoImage(this);
    // Create a new page before closing the previous to not close the current context
    await context.newPage();
    await this.page.close();
    const openedPage = await this.getLastTargetPage(context);
    await openedPage.init(true, true, { meetingId: this.meetingId });
    await openedPage.waitAndClick(e.joinVideo);
    await openedPage.hasElement(e.selectCustomBackground);
  }

  async webcamLayoutStart() {
    await this.joinMicrophone();
    const { videoPreviewTimeout, skipVideoPreview, skipVideoPreviewOnFirstJoin } = this.settings;
    await this.shareWebcam(!(skipVideoPreview || skipVideoPreviewOnFirstJoin), videoPreviewTimeout);
  }
}

exports.Webcam = Webcam;
