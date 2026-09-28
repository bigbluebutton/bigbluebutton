import { expect } from '@playwright/test';

import { checkRootPermission, linkIssue } from '../core/helpers';
import { isLiveKit } from '../core/livekit';
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

  // The outage cases skip themselves when the webcam does not come back, which is the honest
  // outcome for a single case but reads as green when it happens to all of them. This is safe as
  // module state: the file has no parallel mode, so it runs serially in one worker.
  const coverage = { nonReloadStarted: 0, restoreExercised: 0 };

  // A hook rather than a trailing guard test, which --grep can filter out while the matrix runs.
  test.afterAll(() => {
    if (coverage.nonReloadStarted === 0) return;
    expect(
      coverage.restoreExercised,
      'at least one outage flavor must exercise the republish effect restore; an all-skip run is not a pass',
    ).toBeGreaterThan(0);
  });

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
          } else {
            test.skip(
              isLiveKit,
              'the automatic republish effect restore is bbb-webrtc-sfu only; the LiveKit bridge keeps its tracks across reconnects',
            );
            coverage.nonReloadStarted += 1;
          }
          await checkRootPermission();
          const reconnection = new Reconnection(browser, context);
          await reconnection.initModPage(page, { joinParameter: backgroundJoinParameter(background), testInfo });
          await reconnection.initUserPage(context, { testInfo });
          if (await reconnection.webcamBackground(background, outageFlavor, testInfo)) coverage.restoreExercised += 1;
        },
      );
    }
  }
});
