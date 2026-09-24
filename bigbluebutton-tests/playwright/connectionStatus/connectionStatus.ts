import { expect } from '@playwright/test';

import { ELEMENT_WAIT_TIME, ELEMENT_WAIT_EXTRA_LONG_TIME } from '../core/constants';
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

    // Delay /rtt-check responses to simulate ~1500ms RTT ('danger' status).
    await this.modPage.page.route('**/rtt-check**', async (route) => {
      await new Promise<void>((resolve) => { setTimeout(resolve, 1500); });
      await route.continue();
    });

    try {
      await this.modPage.wasRemoved(
        e.connectionStatusItemEmpty,
        'should not display empty item element with connection issues',
        ELEMENT_WAIT_EXTRA_LONG_TIME,
      );
      await this.modPage.hasElementCount(e.connectionStatusItemUser, 1, 'should display one user with connection issues');
    } finally {
      await this.modPage.page.unroute('**/rtt-check**');
    }
  }

  async linkToSettingsTest() {
    // Same approach as reportUserInConnectionIssues: delay /rtt-check to simulate high RTT.
    await this.modPage.page.route('**/rtt-check**', async (route) => {
      await new Promise<void>((resolve) => {
        setTimeout(resolve, 1500);
      });
      await route.continue();
    });

    try {
      await openConnectionStatus(this.modPage);
      await this.modPage.hasElement(
        e.connectionStatusLinkToSettings,
        'should display the link to settings',
        ELEMENT_WAIT_EXTRA_LONG_TIME,
      );
      await this.modPage.waitAndClick(e.connectionStatusLinkToSettings);
      await this.modPage.waitForSelector(e.dataSavingsTab);
    } finally {
      await this.modPage.page.unroute('**/rtt-check**');
    }
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

  async connectionHistoryRegression(consoleMessages: string[]) {
    // Only the routed user gets a degraded RTT, so only it is guaranteed to reach an
    // unstable status under the shipped public.stats.rtt thresholds.
    const delays = [900, 500, 100];
    let requestIndex = 0;
    await this.userPage!.page.route('**/rtt-check', async (route) => {
      const delay = delays[Math.min(requestIndex, delays.length - 1)];
      requestIndex += 1;
      await new Promise((resolve) => { setTimeout(resolve, delay); });
      await route.continue();
    });

    await expect.poll(async () => {
      await openConnectionStatus(this.modPage);
      await this.modPage.page.click('#session-logs-tab');
      const count = await this.modPage.page.locator(e.connectionStatusItemUser).count();
      await this.modPage.page.keyboard.press('Escape');
      return count;
    }, {
      message: 'connection status history should be populated by RTT reports',
      timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
      intervals: [10000],
    }).toBeGreaterThan(0);

    await openConnectionStatus(this.modPage);
    await this.modPage.page.click('#session-logs-tab');
    const degradedUserRow = this.modPage.page
      .locator(e.connectionStatusItemUser)
      .filter({ hasText: this.userPage!.username as string });
    await expect(degradedUserRow).toHaveCount(1);
    await degradedUserRow.click();

    await expect(this.modPage.page.locator(e.connectionStatusTimelineChart)).toBeVisible();
    await expect(this.modPage.page.locator(e.connectionStatusTimelineChart).locator('svg')).toBeVisible();

    const reportsToggle = this.modPage.page.locator(e.connectionStatusRecentReportsToggle);
    await expect(reportsToggle).toBeVisible();
    const historyEntries = this.modPage.page
      .locator(e.connectionStatusRecentReportsList)
      .locator(e.connectionStatusHistoryEntry);

    // The report list ships collapsed; the timeline above it stays visible.
    await expect(reportsToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(historyEntries).toHaveCount(0);

    await reportsToggle.click();
    await expect(reportsToggle).toHaveAttribute('aria-expanded', 'true');
    await expect.poll(async () => historyEntries.count(), {
      message: 'the expanded connection history should include multiple reports',
      timeout: ELEMENT_WAIT_EXTRA_LONG_TIME,
    }).toBeGreaterThan(1);

    const reports = await historyEntries.evaluateAll((items) => (
      items.map((item) => (item.textContent || '').trim())
    ));
    const reportPattern = /Connection status logs as \w+ with a (\d+) ms ping at (.+)/;
    const parsedReports = reports.map((report) => {
      const match = report.match(reportPattern);
      expect(match, `report should preserve both ping and time placeholders: ${report}`).toBeTruthy();
      return { ping: Number(match![1]), time: match![2] };
    });
    expect(parsedReports.every(({ time }) => time.length > 0)).toBeTruthy();
    expect(parsedReports[0].ping).toBeLessThanOrEqual(parsedReports[parsedReports.length - 1].ping);

    const missingKeyWarnings = consoleMessages.filter((message) => (
      /Each child in a list should have a unique "key" prop/i.test(message)
    ));
    expect(missingKeyWarnings).toEqual([]);

    // Collapsing again hides the reports and leaves the timeline in place.
    await reportsToggle.click();
    await expect(reportsToggle).toHaveAttribute('aria-expanded', 'false');
    await expect(historyEntries).toHaveCount(0);
    await expect(this.modPage.page.locator(e.connectionStatusTimelineChart)).toBeVisible();
  }

}
