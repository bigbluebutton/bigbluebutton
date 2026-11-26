import { test } from '../core/setup/fixtures';
import { RoomModeReport } from './roomModeReport';

test.describe.parallel("Room mode recorded in the meeting's events", { tag: '@ci' }, () => {
  test('Every apply of a mode is recorded once, with its settings', async ({ browser, context, page }, testInfo) => {
    const report = new RoomModeReport(browser, context);
    await report.recordsEveryApply(page, { testInfo });
  });

  test('The record stays as it is through a reload, a second moderator and the end', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    const report = new RoomModeReport(browser, context);
    await report.keepsTheRecordAsItIs(page, { testInfo });
  });
});
