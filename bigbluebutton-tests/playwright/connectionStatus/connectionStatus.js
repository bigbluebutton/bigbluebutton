const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME } = require('../core/constants');
const { openConnectionStatus, checkNetworkStatus } = require('./util');

class ConnectionStatus extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async connectionStatusModal() {
    await openConnectionStatus(this.modPage);
    await this.modPage.hasElement(e.connectionStatusModal);
  }

  async usersConnectionStatus() {
    await this.modPage.shareWebcam();
    await this.initUserPage();
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();
    await this.userPage.shareWebcam();
    await openConnectionStatus(this.modPage);

    await this.userPage.page.waitForFunction(checkNetworkStatus,
      e.connectionDataContainer,
      { timeout: ELEMENT_WAIT_TIME },
    );
  }

  async reportUserInConnectionIssues() {
    await openConnectionStatus(this.modPage);
    await this.modPage.waitAndClick(e.connectionStatusTab2);
    await this.modPage.hasElement(e.connectionStatusItemEmpty);
    await this.modPage.page.evaluate(() => window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })));
    await this.modPage.wasRemoved(e.connectionStatusItemEmpty);
    const status = this.modPage.getLocator(e.connectionStatusItemUser);
    await expect(status).toHaveCount(1);
  }

  async linkToSettingsTest() {
    await openConnectionStatus(this.modPage);
    await this.modPage.page.evaluate(() => window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })));
    await this.modPage.hasElement(e.connectionStatusLinkToSettings);
    await this.modPage.waitAndClick(e.connectionStatusLinkToSettings);
    await this.modPage.waitForSelector(e.dataSavingsTab);
  }

  async copyStatsTest(context) {
    await openConnectionStatus(this.modPage);
    await this.modPage.hasElementEnabled(e.copyStats);
    await this.modPage.waitAndClick(e.copyStats);
    await context.grantPermissions(['clipboard-write', 'clipboard-read'], { origin: process.env.BBB_URL });
    const copiedText = await this.modPage.page.evaluate(async () => navigator.clipboard.readText());
    const check = copiedText.includes("audioCurrentUploadRate");
    await expect(check).toBeTruthy();
  }
}

exports.ConnectionStatus = ConnectionStatus;
