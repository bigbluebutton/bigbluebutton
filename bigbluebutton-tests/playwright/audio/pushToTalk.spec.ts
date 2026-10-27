import { linkIssue } from '../core/helpers';
import { exposeLiveKitRooms, isLiveKit } from '../core/livekit';
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

  // #26167: a mute can be dropped while the preceding unmute is not confirmed.
  test(
    'A short M tap leaves the microphone muted',
    { tag: ['@media', '@known-issue'] },
    async ({ browser, browserName, context, page }, testInfo) => {
      test.skip(browserName !== 'chromium', 'the immediate key release uses Chromium CDP input');
      linkIssue(26167);
      await exposeLiveKitRooms(page);
      const audio = new Audio(browser, context);
      await audio.initModPage(page, { testInfo });
      await audio.pushToTalkShortTap();
    },
  );

  // #26167: a late microphone publication can override an acknowledged mute.
  test(
    'Releasing M during microphone publication keeps it muted',
    { tag: ['@media', '@known-issue'] },
    async ({ browser, context, page }, testInfo) => {
      test.skip(!isLiveKit, 'publication while muted is specific to the LiveKit audio bridge');
      linkIssue(26167);
      await exposeLiveKitRooms(page);
      const audio = new Audio(browser, context);
      await audio.initModPage(page, { testInfo });
      await audio.pushToTalkReleaseDuringPublication();
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
