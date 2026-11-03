import { test } from '../core/setup/fixtures';
import { RoomMode } from './roomMode';

test.describe.parallel('Room mode', { tag: '@ci' }, () => {
  test('Moderator sets the room mode for everyone, and it holds', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomMode(browser, context);
    await roomMode.initModPage(page, { testInfo });
    await roomMode.setsAndKeepsModeForEveryone();
  });

  test('Room mode is readable before joining', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomMode(browser, context);
    await roomMode.initModPage(page, { testInfo });
    await roomMode.readsModeBeforeJoining();
  });

  test('Moderator still on the pre-flight cannot set the room mode', async ({ browser, context, page }, testInfo) => {
    const roomMode = new RoomMode(browser, context);
    await roomMode.initModPage(page, { testInfo });
    await roomMode.ignoresModeBeforeJoining();
  });
});
