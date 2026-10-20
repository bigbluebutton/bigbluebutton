import { test } from '../core/setup/fixtures';
import { Audio } from './audio';

test.describe.parallel('Push to talk', { tag: '@ci' }, () => {
  test(
    'Holding M unmutes, releasing it mutes again',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const audio = new Audio(browser, context);
      await audio.initModPage(page, { testInfo });
      await audio.pushToTalk();
    },
  );

  test(
    'Holding M in the chat input does not unmute',
    { tag: '@media' },
    async ({ browser, context, page }, testInfo) => {
      const audio = new Audio(browser, context);
      await audio.initModPage(page, { testInfo });
      await audio.pushToTalkIgnoredInChatInput();
    },
  );
});

test.describe.parallel('Away status', { tag: ['@ci', '@media'] }, () => {
  test('Going away mutes the user and shows them away', async ({ browser, context, page }, testInfo) => {
    const audio = new Audio(browser, context);
    await audio.initModPage(page, { testInfo });
    await audio.initUserPage(context, { testInfo });
    await audio.setAwayWhileTalking();
  });
});
