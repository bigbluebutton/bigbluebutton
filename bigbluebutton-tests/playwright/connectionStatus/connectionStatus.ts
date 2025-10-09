import { expect } from '@playwright/test';

import { ELEMENT_WAIT_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { MultiUsers } from '../user/multiusers';
import { checkNetworkStatus, openConnectionStatus } from './util';

export class ConnectionStatus extends MultiUsers {
  async connectionStatusModal() {
    await openConnectionStatus(this.modPage);
    await this.modPage.hasElement(e.connectionStatusModal, 'should display the connection status modal');
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
    await this.modPage.hasElement(e.connectionStatusItemEmpty, 'should display no users with connection issues');
    await this.modPage.page.evaluate(() =>
      window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })),
    );
    await this.modPage.wasRemoved(
      e.connectionStatusItemEmpty,
      'should not display empty item element with connection issues',
    );
    await this.modPage.hasElementCount(e.connectionStatusItemUser, 1, 'should display one user with connection issues');
  }

  async linkToSettingsTest() {
    await openConnectionStatus(this.modPage);
    await this.modPage.page.evaluate(() =>
      window.dispatchEvent(new CustomEvent('socketstats', { detail: { rtt: 2000 } })),
    );
    await this.modPage.hasElement(e.connectionStatusLinkToSettings, 'should display the link to settings');
    await this.modPage.waitAndClick(e.connectionStatusLinkToSettings);
    await this.modPage.waitForSelector(e.dataSavingsTab);
  }

  async copyStatsTest() {
    await openConnectionStatus(this.modPage);
    await this.modPage.hasElementEnabled(e.copyStats, 'should enable the copy stats button');
    await this.modPage.waitAndClick(e.copyStats);
    await this.modPage?.context?.grantPermissions(['clipboard-write', 'clipboard-read'], {
      origin: process.env.BBB_URL,
    });
    const copiedText = await this.modPage.page.evaluate(async () => navigator.clipboard.readText());
    const check = copiedText.includes('audioCurrentUploadRate');
    await expect(check).toBeTruthy();
  }
}
