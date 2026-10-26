import { isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { LastN } from './lastN';

// Last-N audio (public.media.livekit.selectiveSubscription.lastN): a listener
// plays at most audibleSize microphones and keeps at most standbySize
// subscribed; switching inside the standby set uses setEnabled.
test.describe('Audio Last-N', { tag: ['@ci', '@media'] }, () => {
  test.skip(!isLiveKit, 'Last-N audio is specific to the LiveKit audio bridge');

  test('plays one of two talking microphones with one audible slot', async ({ browser, context }, testInfo) => {
    const lastN = new LastN(browser, context);
    await lastN.initListenerAndSpeakers(testInfo, 1, 1);
    await lastN.expectBoundedPlayback(1, 1);
  });

  test('hands the audible slot to a standby speaker without resubscribing', async ({ browser, context }, testInfo) => {
    const lastN = new LastN(browser, context);
    await lastN.initListenerAndSpeakers(testInfo, 1, 2);
    await lastN.expectSwitchWithoutResubscribe();
  });

  test('hands the audible slot to a standby speaker who starts talking', async ({ browser, context }, testInfo) => {
    const lastN = new LastN(browser, context);
    await lastN.initListenerAndSpeakers(testInfo, 1, 2, { switchableMicrophones: true });
    await lastN.expectSpeechSwitchWithoutResubscribe();
  });

  test('gives the audible slot to a speaker who unmutes, before they talk', async ({ browser, context }, testInfo) => {
    const lastN = new LastN(browser, context);
    await lastN.initListenerAndSpeakers(testInfo, 1, 2, { switchableMicrophones: true, secondSpeakerMuted: true });
    await lastN.expectUnmuteTakesAudibleSlot();
  });
});
