import { test } from '../core/setup/fixtures';
import { CLASS_CREATE_PARAMETER } from './roomMode';
import { RECORDING_ROOM_CREATE_PARAMETER, RoomModeSummary } from './roomModeSummary';

test.describe.parallel('Room mode summary', { tag: '@ci' }, () => {
  test('Shows what each room mode applies', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.initModPageWithPanel(page, { createParameter: RECORDING_ROOM_CREATE_PARAMETER, testInfo });
    await summary.showsWhatEachModeApplies();
  });

  test('Edits the summary with the keyboard, kept or dropped', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.initModPageWithPanel(page, { testInfo });
    await summary.editsSummaryWithKeyboardAndModes();
  });

  test("Starts the waiting room from the room's guest policy", async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.startsWaitingRoomFromRoomPolicies(page, { testInfo });
  });

  test('Leaves recording out of the summary in both rooms', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.leavesRecordingOutInBothRooms(page, { testInfo });
  });

  test('Cancel then Start room leaves the room as created', async ({ browser, context, page }, testInfo) => {
    const summary = new RoomModeSummary(browser, context);
    await summary.initModPageWithPanel(page, { createParameter: CLASS_CREATE_PARAMETER, testInfo });
    await summary.appliesNothingAfterCancel();
  });
});
