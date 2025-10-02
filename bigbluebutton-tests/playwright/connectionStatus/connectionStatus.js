import { expect } from '@playwright/test';
import { MultiUsers } from '../user/multiusers';
import { elements as e } from '../core/elements.ts';
import { ELEMENT_WAIT_TIME } from '../core/constants.ts';
import { openConnectionStatus, checkNetworkStatus } from './util';

export class ConnectionStatus extends MultiUsers {
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

    await this.userPage.page.waitForFunction(checkNetworkStatus, e.connectionDataContainer, {
      timeout: ELEMENT_WAIT_TIME,
    });
  }

  async reportUserInConnectionIssues() {
    await openConnectionStatus(this.modPage);
    await this.modPage.waitAndClick(e.connectionStatusTab2);
    await this.modPage.hasElement(e.connectionStatusItemEmpty);
    await this.modPage.page.evaluate(() =>
      window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } }))
    );
    await this.modPage.wasRemoved(e.connectionStatusItemEmpty);
    await this.modPage.hasElementCount(e.connectionStatusItemUser, 1);
  }

  async linkToSettingsTest() {
    await openConnectionStatus(this.modPage);
    await this.modPage.page.evaluate(() =>
      window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } }))
    );
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
    const check = copiedText.includes('audioCurrentUploadRate');
    await expect(check).toBeTruthy();
  }
}
