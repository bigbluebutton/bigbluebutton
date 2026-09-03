import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { getLocalMicState } from './liveKitProbe';
import {
  expectViewerAudioFlowing,
  failPublishAfterItLands,
  getLandedPublishCount,
  initReconnectionScenario,
  muteViewer,
  unmuteViewer,
  UNPUBLISH_SETTLE_TIME,
} from './liveKitReconnection';

// The audio bridge treats a publish whose track reached the room anyway as a
// success: a reconnect can make the awaited call reject after the SDK has
// already put the track out, and reconnecting again over a working publication
// would only churn the session.
test.describe('LiveKit publish recovery', { tag: ['@ci', '@media'] }, () => {
  test.beforeEach(() => {
    test.skip(!isLiveKit, 'the publish path under test is specific to the LiveKit bridge');
  });

  test('a publish that rejects after its track landed is recovered, not masked', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 6);
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { viewerPage } = fixture;

    await expectViewerAudioFlowing(fixture);

    // Mute past the deferred unpublish so the next unmute goes through the
    // publish path rather than a track-level unmute.
    await muteViewer(fixture);
    await viewerPage.page.waitForTimeout(UNPUBLISH_SETTLE_TIME);
    expect(
      (await getLocalMicState(viewerPage.page)).micPublications,
      'the mute should have unpublished the microphone before the unmute',
    ).toBe(0);

    expect(await failPublishAfterItLands(viewerPage.page), 'the injection needs the room registry exposed').toBe(true);

    await unmuteViewer(fixture);

    // Positive controls: the publish really reached the room, and the
    // publication really exists. Together they are the precondition of the
    // branch under test - without them the bridge takes another path entirely.
    await expect(async () => {
      expect(
        await getLandedPublishCount(viewerPage.page),
        'the injected publish should have reached the room',
      ).toBeGreaterThan(0);
      expect(
        (await getLocalMicState(viewerPage.page)).micPublications,
        'the rejected publish should still have left a publication behind',
      ).toBeGreaterThan(0);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    await expect(async () => {
      expect(
        fixture.viewerLogLines.filter((line) => line.includes('livekit_audio_publish_error')),
        'the publish should have reported a failure',
      ).not.toEqual([]);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // The recovery for that state must run. Today it reads a binding scoped to
    // the try block it is not in, so it throws instead - and the ReferenceError
    // replaces the real error in every log the failure produces.
    expect(
      fixture.viewerLogLines.filter((line) => line.includes('micRoom is not defined')),
      'recovering a landed publish should not throw a ReferenceError',
    ).toEqual([]);
  });
});
