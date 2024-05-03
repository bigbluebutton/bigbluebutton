const { default: test } = require('@playwright/test');
const Page = require('../core/page');
const { MultiUsers } = require('../user/multiusers');
const { startScreenshare } = require('./util');
const e = require('../core/elements');
const { getSettings } = require('../core/settings');

class ScreenShare extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async startSharing() {
    const { screensharingEnabled } = getSettings();

    if(!screensharingEnabled) {
      await this.hasElement(e.joinVideo);
      return this.wasRemoved(e.startScreenSharing);
    }
    await startScreenshare(this);
    await this.hasElement(e.isSharingScreen);
  }

  async testMobileDevice() {
    await this.wasRemoved(e.startScreenSharing);
  }

  async screenshareStopsExternalVideo() {
    const { screensharingEnabled } = getSettings();

    await this.waitForSelector(e.whiteboard);

    if(!screensharingEnabled) {
      await this.hasElement(e.joinVideo);
      return this.wasRemoved(e.startScreenSharing);
    }

    await this.waitAndClick(e.actions);
    await this.waitAndClick(e.shareExternalVideoBtn);
    await this.waitForSelector(e.closeModal);
    await this.type(e.videoModalInput, e.youtubeLink);
    await this.waitAndClick(e.startShareVideoBtn);

    const modFrame = await this.getYoutubeFrame();
    await modFrame.hasElement('video');

    await startScreenshare(this);
    await this.hasElement(e.isSharingScreen);

    await this.hasElement(e.stopScreenSharing);
    await this.waitAndClick(e.stopScreenSharing);
    await this.hasElement(e.whiteboard);
  }
}

class MultiUserScreenShare extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async startSharing(page) {
    const { screensharingEnabled } = getSettings();

    if(!screensharingEnabled) {
      await this.hasElement(e.joinVideo);
      return this.wasRemoved(e.startScreenSharing);
    }
    await startScreenshare(page);
    await page.hasElement(e.isSharingScreen);
  }
}

exports.ScreenShare = ScreenShare;
exports.MultiUserScreenShare = MultiUserScreenShare;
