import { test } from '../core/setup/fixtures';
import { RoomModeApply } from './roomModeApply';

// See: docs/docs/testing/release-testing.md (Room mode applied after the join)
test.describe.parallel('Room mode applied after the join', { tag: '@ci' }, () => {
  test('Start room applies the class preset once, for everyone', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.appliesClassPresetOnce(page, { testInfo });
  });

  test('Start room applies the presets as edited', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await test.step('An edited switch wins over the preset, and an edited guest policy is applied', async () => {
      await apply.appliesEditsOverPreset(page, { testInfo });
    });
    await test.step('A room without chat keeps its public chat lock', async () => {
      await apply.leavesPublicChatLockedWithoutChat(await apply.newPageForNextRoom(), { testInfo });
    });
    await test.step('Start room applies the meeting preset', async () => {
      await apply.appliesMeetingPreset(await apply.newPageForNextRoom(), { testInfo });
    });
  });

  test('The room opens once the mode is recorded, settings first', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await apply.holdsRoomUntilModeRecorded(page, { testInfo });
  });

  test('The room opens with no mode when applying fails or hangs', async ({ browser, context, page }, testInfo) => {
    const apply = new RoomModeApply(browser, context);
    await test.step('The room opens with no mode when applying fails', async () => {
      await apply.opensRoomWhenApplyFails(page, { testInfo });
    });
    await test.step('The room opens with no mode when applying hangs', async () => {
      await apply.opensRoomWhenApplyHangs(await apply.newPageForNextRoom(), { testInfo });
    });
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
});
