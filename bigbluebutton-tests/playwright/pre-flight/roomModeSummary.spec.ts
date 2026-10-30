import { test } from '../core/setup/fixtures';
import { CLASS_CREATE_PARAMETER } from './roomMode';
import { RECORDING_ROOM_CREATE_PARAMETER, RoomModeSummary } from './roomModeSummary';

test.describe.parallel('Room mode summary', { tag: '@ci' }, () => {
  test('Shows what each room mode applies', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.initModPageWithPanel(page, { createParameter: RECORDING_ROOM_CREATE_PARAMETER, testInfo });
    await summary.showsWhatEachModeApplies();
  });

  test('Keeps an edit while the mode stays picked', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.initModPageWithPanel(page, { testInfo });
    await summary.keepsEditsWhileModeStaysPicked();
  });

  test('Drops the edits when the mode changes or is cancelled', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.initModPageWithPanel(page, { testInfo });
    await summary.dropsEditsOnModeChangeAndCancel();
  });

  test("Starts the waiting room from the room's default policy", async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.startsWaitingRoomFromRoom(page, 'ALWAYS_ACCEPT', { testInfo });
  });

  test("Starts the waiting room from the room's own policy", async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.startsWaitingRoomFromRoom(page, 'ASK_MODERATOR', { testInfo });
  });

  test("Keeps offering a room's policy the list does not offer", async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.showsRoomOnlyGuestPolicy(page, { testInfo });
  });

  test('Leaves recording out for a room that records on its own', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.leavesRecordingOut(page, true, { testInfo });
  });

  test('Leaves recording out for a room that cannot record', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.leavesRecordingOut(page, false, { testInfo });
  });

  test('Cancel then Start room leaves the room as created', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.initModPageWithPanel(page, { createParameter: CLASS_CREATE_PARAMETER, testInfo });
    await summary.appliesNothingAfterCancel();
  });

  test('Edits the summary on a phone', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.reachesSummaryOnPhone(page, { testInfo });
  });

  test('Operates the summary with the keyboard', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.initModPageWithPanel(page, { testInfo });
    await summary.operatesSummaryWithKeyboard();
  });
});
