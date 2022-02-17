const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { openConnectionStatus, checkNetworkStatus } = require('./util');
const { startScreenshare } = require('../screenshare/util');
const { waitAndClearNotification } = require('../notifications/util');


class ConnectionStatus extends MultiUsers {
  constructor(browser, context) {
    super(browser, context);
  }

  async connectionStatusModal() {
    await openConnectionStatus(this.modPage);
    await this.modPage.hasElement(e.connectionStatusModal);
  }

  async disableScreenshareFromConnectionStatus() {
    await startScreenshare(this.modPage);
    await openConnectionStatus(this.modPage);
    await this.modPage.waitAndClickElement(e.dataSavingScreenshare);
    await this.modPage.waitAndClickElement(e.closeModal);
    await this.modPage.hasElement(e.screenshareLocked);
  }

  async disableWebcamsFromConnectionStatus() {
    await this.modPage.shareWebcam(ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.shareWebcam(ELEMENT_WAIT_LONGER_TIME);
    await openConnectionStatus(this.modPage);
    await this.modPage.waitAndClickElement(e.dataSavingWebcams);
    await this.modPage.waitAndClickElement(e.closeModal);
    await waitAndClearNotification(this.modPage);
    const checkUserWhoHasDisabled = await this.modPage.getSelectorCount(e.webcamContainer);
    await expect(checkUserWhoHasDisabled).toBe(1);
    const checkSecondUser = await this.userPage.getSelectorCount(e.webcamContainer);
    await expect(checkSecondUser).toBe(2);
  }

  async usersConnectionStatus() {
    await this.modPage.shareWebcam();
    await this.initUserPage();
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();
    await this.userPage.shareWebcam();
    await this.userPage.waitAndClick(e.connectionStatusBtn);

    await this.userPage.page.waitForFunction(checkNetworkStatus,
      e.connectionDataContainer,
      { timeout: ELEMENT_WAIT_TIME },
    );
  }

  async reportUserInConnectionIssues() {
    await openConnectionStatus(this.modPage);
    await this.modPage.hasElement(e.connectionStatusItemEmpty);
    await this.modPage.page.evaluate(() => window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })));
    await this.modPage.wasRemoved(e.connectionStatusItemEmpty);
    await this.modPage.hasElement(e.connectionStatusItemUser);
  }
}

exports.ConnectionStatus = ConnectionStatus;
