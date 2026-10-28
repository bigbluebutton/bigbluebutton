import { test } from '../core/setup/fixtures';
import { RoomModePanel } from './roomModePanel';
import { RoomModeSummary } from './roomModeSummary';

test.describe.parallel('Room mode panel', { tag: '@ci' }, () => {
  test('Moderator sees the panel and picks room modes', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPageWithPanel(page, { testInfo });
    await panel.usesPanelInUnconfiguredRoom();
  });

  test('Viewers and configured rooms never get the panel', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPage(page, { testInfo });
    await panel.hidesPanelFromViewerAndConfiguredRoom();
  });

  test('No panel and no room mode in a breakout room', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.noPanelNorModeInBreakout(page, { testInfo });
  });

  test('Starting without a mode leaves the room unconfigured', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPageWithPanel(page, { testInfo });
    await panel.startsWithoutMode();
  });

  test('Panels become tabs on a phone and a tablet, the summary fits a phone', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.panelsBecomeTabsOnPhoneAndTablet(page, { testInfo });
    await test.step('Edits the summary on a phone', async () => {
      await summary.reachesSummaryOnPhone(await summary.newPageForNextRoom(), { testInfo });
    });
  });

  test('No panel with its setting off', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.noPanelWhenDisabled(page, { testInfo });
  });

  test('Keeps the picked mode under the device permission screen', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.keepsModeUnderDevicePermissionScreen(page, { testInfo });
  });

  test('Keeps the setup panel across the tabs breakpoints', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.keepsSetupAcrossTabsBreakpoints(page, { testInfo });
  });

  test('Locks the mode cards while the room is starting', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.locksCardsWhileJoining(page, { testInfo });
  });

  test('Keeps the desktop layout for a viewer on a tablet', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPage(page, { testInfo });
    await panel.viewerKeepsDesktopLayoutOnTablet();
  });

  test('Join notices stay visible on a desktop and a phone', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.showsJoinNoticesOnDesktopAndPhone(page, { testInfo });
  });

  test('No panel for a bot moderator', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.noPanelForBot(page, { testInfo });
  });
});
