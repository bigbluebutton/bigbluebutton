import { test } from '../core/setup/fixtures';
import { RoomMode } from './roomMode';

test.describe.parallel('Room mode', { tag: '@ci' }, () => {
  test('Moderator sets the room mode for everyone', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomMode(browser, context);
    await roomMode.initModPage(page, { testInfo });
    await roomMode.setsModeForEveryone();
  });

  test('Room mode is readable before joining', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomMode(browser, context);
    await roomMode.initModPage(page, { testInfo });
    await roomMode.readsModeBeforeJoining();
  });

  test('Viewer cannot set the room mode', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomMode(browser, context);
    await roomMode.initModPage(page, { testInfo });
    await roomMode.refusesModeFromViewer();
  });

  test('Room mode survives a reload and a rejoin', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomMode(browser, context);
    await roomMode.initModPage(page, { testInfo });
    await roomMode.keepsModeAcrossReloadAndRejoin();
  });
});
