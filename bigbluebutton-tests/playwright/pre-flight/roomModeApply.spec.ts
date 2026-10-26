import { test } from '../core/setup/fixtures';
import { RoomModeApply } from './roomModeApply';

// See: docs/docs/testing/release-testing.md (Room mode applied after the join)
test.describe.parallel('Room mode applied after the join', { tag: '@ci' }, () => {
  test('Start room applies the class preset', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.appliesClassPreset(page, { testInfo });
  });

  test('Start room applies the meeting preset', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.appliesMeetingPreset(page, { testInfo });
  });

  test('A viewer who joins later gets the applied settings', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.viewerJoiningLaterSeesAppliedSettings(page, { testInfo });
  });

  test('An edited switch wins over the preset', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.editedSwitchWinsOverPreset(page, { testInfo });
  });

  test('A reload does not apply the mode again', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.reloadDoesNotReapply(page, { testInfo });
  });

  test('Settings land before the room mode is recorded', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.settingsLandBeforeRoomMode(page, { testInfo });
  });

  test('The room opens with no mode when applying fails', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.opensRoomWhenApplyFails(page, { testInfo });
  });

  test('The pre-flight stays up until the mode is recorded', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.holdsPanelUntilRoomModeRecorded(page, { testInfo });
  });

  test('The room opens with no mode when applying hangs', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.opensRoomWhenApplyHangs(page, { testInfo });
  });

  test('Nothing more is sent once the deadline passes', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.sendsNothingAfterDeadline(page, { testInfo });
  });

  test('A mode set by another moderator is not overwritten', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.keepsModeSetByAnotherModerator(page, { testInfo });
  });

  test('Another moderator in the room keeps it as it is', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.keepsRoomRunningByAnotherModerator(page, { testInfo });
  });

  test('A mode set during the join is not overwritten', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.keepsModeSetDuringJoin(page, { testInfo });
  });

  test('A room without chat keeps its public chat lock', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.leavesPublicChatLockedWithoutChat(page, { testInfo });
  });

  test('An edited guest policy is applied', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.appliesEditedGuestPolicy(page, { testInfo });
  });
});
