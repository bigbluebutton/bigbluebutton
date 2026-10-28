import { test } from '../core/setup/fixtures';
import { RoomModeSwitch } from './roomModeSwitch';

// See: docs/docs/testing/release-testing.md (Room mode change during the session)
test.describe.parallel('Room mode change during the session', { tag: '@ci' }, () => {
  test('Switching from the tab reaches everyone', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.switchesFromTheTab(page, { testInfo });
  });

  test('The tab needs its setting and takes a skipped pick', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await test.step('No room modes tab with its setting off', async () => {
      await roomMode.noTabWhenDisabled(page, { testInfo });
    });
    await test.step('A pick the pre-flight skipped can be applied from the tab', async () => {
      await roomMode.picksUpSkippedPick(await roomMode.newPageForNextRoom(), { testInfo });
    });
  });

  test('An edited control wins over the new mode', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.editedControlWins(page, { testInfo });
  });

  test('A reload after the switch applies nothing again', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.reloadChangesNothing(page, { testInfo });
  });

  test('A second moderator joining does not re-apply the mode', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.secondModeratorDoesNotReapply(page, { testInfo });
  });
});
