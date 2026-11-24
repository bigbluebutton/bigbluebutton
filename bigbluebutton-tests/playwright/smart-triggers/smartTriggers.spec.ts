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

    // https://docs.bigbluebutton.org/4.0/testing/release-testing/#hand-still-raised-automated
    test('Suggest lowering the hand after speaking', async ({ browser, context, page }, testInfo) => {
      const smartTriggers = new SmartTriggers(browser, context);
      await smartTriggers.initModPage(page, {
        clientSettingsOverrides: smartTriggersOverride('handStillRaised'),
        shouldCloseAudioModal: false,
        testInfo,
      });
      await smartTriggers.handStillRaisedLowersHand();
    });

    // https://docs.bigbluebutton.org/4.0/testing/release-testing/#no-microphone-signal-automated
    // A 0 dB threshold turns the fake microphone's speech into silence.
    test('No microphone signal hint opens the audio settings', async ({ browser, context, page }, testInfo) => {
      const smartTriggers = new SmartTriggers(browser, context);
      await smartTriggers.initModPage(page, {
        clientSettingsOverrides: smartTriggersOverride('noMicSignal', { afterSeconds: 3, signalFloorDb: 0 }),
        shouldCloseAudioModal: false,
        testInfo,
      });
      await smartTriggers.noMicSignalOpensAudioSettings();
    });
  });
});
