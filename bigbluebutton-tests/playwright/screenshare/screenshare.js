const { default: test } = require('@playwright/test');
const Page = require('../core/page');
const { startScreenshare } = require('./util');
const e = require('../core/elements');
const { getSettings } = require('../core/settings');

class ScreenShare extends Page {
  constructor(browser, page) {
    super(browser, page);
  }

  async startSharing() {
    const { screensharingEnabled } = getSettings();
    test.fail(!screensharingEnabled, 'Screensharing is disabled');
    await startScreenshare(this);
    await this.hasElement(e.isSharingScreen);
  }

  async testMobileDevice() {
    await this.wasRemoved(e.startScreenSharing);
  }
}

exports.ScreenShare = ScreenShare;
