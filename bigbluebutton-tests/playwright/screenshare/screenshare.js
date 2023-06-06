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
    test.fail(!screensharingEnabled, 'Screensharing is disabled');
    await startScreenshare(this);
    await this.hasElement(e.isSharingScreen);
  }

  async testMobileDevice() {
    await this.wasRemoved(e.startScreenSharing);
  }
}

class MultiUserScreenShare extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async startSharing(page) {
    const { screensharingEnabled } = getSettings();
    test.fail(!screensharingEnabled, 'Screensharing is disabled');
    await startScreenshare(page);
    await page.hasElement(e.isSharingScreen);
  }
}

exports.ScreenShare = ScreenShare;
exports.MultiUserScreenShare = MultiUserScreenShare;
