import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { getLocalMicState } from './liveKitProbe';
import {
  ejectViewerByUserLeftSweep,
  expectMicUiMatchesPublication,
  expectViewerAudioFlowing,
  expectViewerRejoined,
  getLiveCameraIdentities,
  getLocalCameraState,
  initReconnectionScenario,
  PASSIVE_REMOVAL_WAIT_TIME,
  REJOIN_WAIT_TIME,
  sampleMediaOutage,
  sampleVoiceClaims,
  unmuteViewer,
  waitForMediaInterrupted,
} from './liveKitReconnection';
import { connectMicrophone } from './util';

// A media-only outage: the LiveKit signal socket stays open and carries
// nothing either way, which is what a saturated media server or a broken NAT
// binding looks like from the browser. GraphQL is left alone throughout, so
// every mutation and subscription still works and the client is in no doubt
// about the meeting - only about its media.
const OUTAGE_TIME = 25_000;
// Past the SDK's own reconnect sequence and the room's retry window, so a
// client that is going to come back has had every chance to.
const RECOVERY_WINDOW = 60_000;
// Long enough for a rejoin's republish paths to have run if they were going to.
const SETTLE_TIME = 30_000;

test.describe('LiveKit media outage', { tag: ['@ci', '@media'] }, () => {
  test.beforeEach(() => {
    test.skip(!isLiveKit, 'the media session under test is specific to the LiveKit bridge');
  });

  test('an open microphone with nothing behind it is not left unannounced', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 12);
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { viewerPage } = fixture;

    await expectViewerAudioFlowing(fixture);

    fixture.stallLiveKitSignal();
    const interruptedAs = await waitForMediaInterrupted(viewerPage.page);
    const samples = await sampleMediaOutage(viewerPage.page, OUTAGE_TIME);
    await fixture.dropLiveKitSignal();

    // Positive control: the outage has to have been visible to the probe at all.
    expect(
      samples.filter((sample) => sample.mediaConnected === false).length,
      `the outage should have been observable in the samples (interrupted as ${interruptedAs})`,
    ).toBeGreaterThan(0);

    // Any one of the three being different is a defensible outcome: the media
    // session recovered, the UI stopped offering an open microphone, or the
    // user was told. All three together, at any instant, is a microphone the
    // user believes is transmitting while nothing is.
    const silentOpenMic = samples.filter(
      (sample) => sample.mediaConnected === false && sample.showsOpenMic && sample.toldTheUser === false,
    );
    expect(silentOpenMic, 'a dead media session must not be presented as an open microphone in silence').toEqual([]);
  });

  test('the voice record does not keep a silent user talking', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 12);
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { modPage, viewerPage, viewerUserId } = fixture;

    // expectViewerAudioFlowing has already proven the mic is carrying audio,
    // which is what puts talking and the floor on the record in the first place.
    await expectViewerAudioFlowing(fixture);

    fixture.stallLiveKitSignal();
    await waitForMediaInterrupted(viewerPage.page);
    const samples = await sampleVoiceClaims(viewerPage.page, modPage.page, viewerUserId, OUTAGE_TIME);
    await fixture.dropLiveKitSignal();

    // Positive control: the record has to have been readable while the media
    // session was down, or the assertion below is vacuous.
    const relevant = samples.filter((sample) => sample.mediaConnected === false && sample.rowPresent);
    expect(
      relevant.length,
      `the viewer voice record should have been readable during the outage (samples ${JSON.stringify(samples)})`,
    ).toBeGreaterThan(0);

    // The client is the only source of talking state and it has no media
    // session left to derive it from, so it must not leave a stale claim
    // standing: other participants read this as the active speaker.
    expect(
      relevant.filter((sample) => sample.talking),
      'a viewer whose media session is down should not be recorded as talking',
    ).toEqual([]);
  });

  test('media comes back when the network does, or the user can rejoin', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 16);
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { viewerPage } = fixture;

    await expectViewerAudioFlowing(fixture);

    fixture.stallLiveKitSignal();
    await waitForMediaInterrupted(viewerPage.page);
    await viewerPage.page.waitForTimeout(OUTAGE_TIME);
    // Closing the starved socket and lifting the stall is a healthy network
    // again: nothing else about the page or the meeting has changed.
    await fixture.dropLiveKitSignal();

    // Give the client every chance to come back on its own first.
    let recovered = false;
    await expect(async () => {
      recovered = (await getLocalMicState(viewerPage.page)).roomState === 'connected';
      expect(recovered, 'waiting for the media session to come back on its own').toBe(true);
    })
      .toPass({ timeout: RECOVERY_WINDOW })
      .catch(() => {});

    // It did not. The only affordance the client offers then is re-joining
    // audio, so that has to work instead - attempted once, not in a retry loop.
    let rejoinError = 'not attempted';
    if (!recovered && (await viewerPage.checkElement(e.joinAudio))) {
      rejoinError = await connectMicrophone(viewerPage).then(
        () => '',
        (error: Error) => error.message.slice(0, 200),
      );
    }

    expect(
      (await getLocalMicState(viewerPage.page)).roomState,
      `the media session should be usable again once the network is (rejoin: ${rejoinError})`,
    ).toBe('connected');

    // The voice record is re-created without a track when the session comes
    // back, so the user returns muted. That is the same contract the matrix
    // pins for a server-side leave: what recovery owes is a session that
    // agrees with its UI and unmutes on request, not audio without being asked.
    await expectMicUiMatchesPublication(fixture);
    await unmuteViewer(fixture);
    await expectViewerAudioFlowing(fixture);
  });

  test('a webcam survives an eject and rejoin, or the user is told it did not', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 4 + PASSIVE_REMOVAL_WAIT_TIME + REJOIN_WAIT_TIME * 2 + SETTLE_TIME);
    const fixture = await initReconnectionScenario(browser, testInfo, { webcam: true });
    const { modPage, viewerPage, viewerUserId } = fixture;

    await expectViewerAudioFlowing(fixture);
    const cameraBefore = await getLocalCameraState(viewerPage.page);
    expect(cameraBefore.publications, 'the viewer should be publishing a camera to begin with').toBeGreaterThan(0);
    await expect(async () => {
      expect(
        await getLiveCameraIdentities(modPage.page),
        'the moderator should receive the viewer camera to begin with',
      ).toContain(viewerUserId);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });

    // The sweep ejects a browser that is still open, and the client re-admits
    // itself as soon as GraphQL is back. The microphone comes back with it.
    await ejectViewerByUserLeftSweep(fixture);
    fixture.restoreGraphql();
    await fixture.waitForGraphqlReconnected(REJOIN_WAIT_TIME);
    await expectViewerRejoined(fixture);
    await viewerPage.page.waitForTimeout(SETTLE_TIME);

    const cameraAfter = await getLocalCameraState(viewerPage.page);
    const moderatorSees = (await getLiveCameraIdentities(modPage.page)).includes(viewerUserId);
    const toasts = await viewerPage.page.locator(e.smallToastMsg).allTextContents();
    const wasTold = toasts.some((text) => text.trim().length > 0);

    // Losing the camera on a rejoin may be a deliberate choice, but losing it
    // without saying so is not: the user goes on presenting to a meeting that
    // cannot see them.
    expect(
      cameraAfter.publications === 0 && moderatorSees === false && wasTold === false,
      `a camera dropped by a rejoin must not be dropped in silence (observed ${JSON.stringify({
        cameraBefore,
        cameraAfter,
        moderatorSees,
        toasts,
      })})`,
    ).toBe(false);
  });
});
