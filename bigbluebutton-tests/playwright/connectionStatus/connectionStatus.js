const { expect } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const e = require('../core/elements');
const { ELEMENT_WAIT_TIME, ELEMENT_WAIT_LONGER_TIME } = require('../core/constants');
const { openConnectionStatus, checkNetworkStatus } = require('./util');
const { startScreenshare } = require('../screenshare/util');
const { checkElementLengthEqualTo } = require('../core/util');
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
    await this.modPage.waitAndClickElement(e.closeConnectionStatusModal);
    await this.modPage.hasElement(e.screenshareLocked);
  }

  async disableWebcamsFromConnectionStatus() {
    await this.modPage.shareWebcam(true, ELEMENT_WAIT_LONGER_TIME);
    await this.userPage.shareWebcam(true, ELEMENT_WAIT_LONGER_TIME);
    await openConnectionStatus(this.modPage);
    await this.modPage.waitAndClickElement(e.dataSavingWebcams);
    await this.modPage.waitAndClickElement(e.closeConnectionStatusModal);
    await waitAndClearNotification(this.modPage);
    const checkUserWhoHasDisabled = await this.modPage.page.evaluate(checkElementLengthEqualTo, [e.videoContainer, 1]);
    const checkSecondUser = await this.userPage.page.evaluate(checkElementLengthEqualTo, [e.videoContainer, 2]);
    await expect(checkUserWhoHasDisabled).toBeTruthy();
    await expect(checkSecondUser).toBeTruthy();
  }

  async usersConnectionStatus() {
    await this.modPage.shareWebcam(true);
    await this.initUserPage();
    await this.userPage.waitAndClick(e.joinAudio);
    await this.userPage.joinMicrophone();
    await this.userPage.shareWebcam(true);
    await this.userPage.waitAndClick(e.connectionStatusBtn);

    await this.userPage.page.waitForFunction(checkNetworkStatus,
      { dataContainer: e.connectionDataContainer, networdData: e.connectionNetwordData },
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
