import { test } from '../core/setup/fixtures';
import { SmartTriggers } from './smartTriggers';
import { smartTriggersOverride } from './util';

test.describe.parallel('Smart triggers', { tag: '@ci' }, () => {
  test.describe.parallel('Microphone', { tag: '@media' }, () => {
    // https://docs.bigbluebutton.org/4.0/testing/release-testing/#muted-alert-automated
    test('Muted alert stays off after a click until the next unmute', async ({ browser, context, page }, testInfo) => {
      const smartTriggers = new SmartTriggers(browser, context);
      await smartTriggers.initModPage(page, {
        clientSettingsOverrides: smartTriggersOverride('talkingWhileMuted'),
        shouldCloseAudioModal: false,
        testInfo,
      });
      await smartTriggers.mutedAlertStaysOffUntilUnmute();
    });
  });
});
