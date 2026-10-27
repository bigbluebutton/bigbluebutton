import { test } from '../core/setup/fixtures';
import { RoomModeSwitch } from './roomModeSwitch';

// See: docs/docs/testing/release-testing.md (Room mode change during the session)
test.describe.parallel('Room mode change during the session', { tag: '@ci' }, () => {
  test('Only moderators get the room modes tab', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.showsTabToModeratorsOnly(page, { testInfo });
  });

  test('No room modes tab with its setting off', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.noTabWhenDisabled(page, { testInfo });
  });

  test('Switching applies the new mode over the room as created', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.switchesOverBaseConfiguration(page, { testInfo });
  });

  test('An edited control wins over the new mode', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.editedControlWins(page, { testInfo });
  });

  test('Settings fixed for the session show disabled', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.showsFixedSettingsDisabled(page, { testInfo });
  });

  test('Nothing to change until another mode is picked', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.changeNeedsADifferentMode(page, { testInfo });
  });

  test('Closing with a pending pick asks first', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.asksBeforeDiscardingAPick(page, { testInfo });
  });

  test('A reload after the switch applies nothing again', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.reloadChangesNothing(page, { testInfo });
  });

  test('A second moderator joining does not re-apply the mode', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.secondModeratorDoesNotReapply(page, { testInfo });
  });

  test('A pick the pre-flight skipped can be applied from the tab', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.picksUpSkippedPick(page, { testInfo });
  });

  test('A viewer in the room follows the switch', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomModeSwitch(browser, context);
    await roomMode.viewerFollowsTheSwitch(page, { testInfo });
  });
});
