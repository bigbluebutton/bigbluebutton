import { test } from '../core/setup/fixtures';
import { RoomModePanel } from './roomModePanel';

test.describe.parallel('Room mode panel', { tag: '@ci' }, () => {
  test('Moderator sees the panel in a room with no mode', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPageWithPanel(page, { testInfo });
    await panel.showsPanelInUnconfiguredRoom();
  });

  test('Picks a room mode and cancels it', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPageWithPanel(page, { testInfo });
    await panel.picksAndClearsMode();
  });

  test('Viewer never sees the panel', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPage(page, { testInfo });
    await panel.viewerNeverSeesPanel();
  });

  test('No panel in a room that already has a mode', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPage(page, { testInfo });
    await panel.noPanelInConfiguredRoom();
  });

  test('No panel in a breakout room', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.noPanelInBreakout(page, { testInfo });
  });

  test('Starting without a mode leaves the room unconfigured', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPageWithPanel(page, { testInfo });
    await panel.startsWithoutMode();
  });

  test('Panels become tabs on a phone', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.panelsBecomeTabsOnPhone(page, { testInfo });
  });

  test('No panel with its setting off', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.noPanelWhenDisabled(page, { testInfo });
  });

  test('Keeps the picked mode under the device permission screen', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.keepsModeUnderDevicePermissionScreen(page, { testInfo });
  });

  test('Moves between room modes with the arrow keys', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPageWithPanel(page, { testInfo });
    await panel.movesBetweenModesWithArrows();
  });

  test('Keeps the setup panel across the tabs breakpoints', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.keepsSetupAcrossTabsBreakpoints(page, { testInfo });
  });

  test('Locks the mode cards while the room is starting', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.locksCardsWhileJoining(page, { testInfo });
  });

  test('Turns the panels into tabs on a tablet', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.panelsBecomeTabsOnTablet(page, { testInfo });
  });

  test('Keeps the desktop layout for a viewer on a tablet', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.initModPage(page, { testInfo });
    await panel.viewerKeepsDesktopLayoutOnTablet();
  });

  test('Shows the join notices in the panel footer', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.showsJoinNoticesInPanelFooter(page, { testInfo });
  });

  test('No panel for a bot moderator', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.noPanelForBot(page, { testInfo });
  });

  test('Keeps the join notices visible on a phone', async ({ browser, context, page }, testInfo) => {
    const panel = new RoomModePanel(browser, context);
    await panel.showsJoinNoticesOnPhone(page, { testInfo });
  });
});
