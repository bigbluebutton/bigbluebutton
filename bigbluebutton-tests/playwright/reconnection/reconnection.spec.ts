import { checkRootPermission, linkIssue } from '../core/helpers';
import { test } from '../core/setup/fixtures';
import { backgroundJoinParameter, BackgroundSource, OutageFlavor, Reconnection } from './reconnection';

test.describe('Reconnection', () => {
  test('Chat', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo });
    await reconnection.chat();
  });

  test('Audio', async ({ browser, context, page }, testInfo) => {
    await checkRootPermission(); // check sudo permission before starting test
    const reconnection = new Reconnection(browser, context);
    await reconnection.initModPage(page, { testInfo });
    await reconnection.microphone();
  });

  const backgrounds: BackgroundSource[] = ['built-in', 'custom', 'join-parameter'];
  const outages: OutageFlavor[] = ['signaling', 'short-media', 'long-media', 'reload'];
  for (const background of backgrounds) {
    for (const outageFlavor of outages) {
      const reproducesIssue = outageFlavor === 'reload';
      test(
        `Webcam background: ${background}, ${outageFlavor}`,
        reproducesIssue ? { tag: '@known-issue' } : {},
        async ({ browser, context, page }, testInfo) => {
          if (reproducesIssue) {
            linkIssue(25266);
            test.fail(true, 'Reloading the meeting is outside the media reconnection coverage');
          }
          await checkRootPermission();
          const reconnection = new Reconnection(browser, context);
          await reconnection.initModPage(page, { joinParameter: backgroundJoinParameter(background), testInfo });
          await reconnection.initUserPage(context, { testInfo });
          await reconnection.webcamBackground(background, outageFlavor, testInfo);
        },
      );
    }
  }
});
