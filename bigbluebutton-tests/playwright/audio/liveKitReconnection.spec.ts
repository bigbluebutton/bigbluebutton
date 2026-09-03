import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { getMeetingUserIds } from './floorProbe';
import { getAudioPublisherIdentities, getLocalMicState } from './liveKitProbe';
import {
  ejectViewerByUserLeftSweep,
  expectMicUiMatchesPublication,
  expectViewerAudioFlowing,
  expectViewerRejoined,
  expectViewerSilent,
  getLiveCameraIdentities,
  getLocalCameraState,
  getPrimaryRoomTag,
  getRoomOptionsState,
  initReconnectionScenario,
  muteViewer,
  PASSIVE_REMOVAL_WAIT_TIME,
  RECONNECT_WAIT_TIME,
  REJOIN_WAIT_TIME,
  simulateRoomScenario,
  startMicUiWatch,
  startRoomStateWatch,
  stopMicUiWatch,
  stopRoomStateWatch,
  tagPrimaryRoom,
  unmuteViewer,
  UNPUBLISH_SETTLE_TIME,
  waitForRoomReconnected,
} from './liveKitReconnection';

// Media survival across the reconnection paths of the LiveKit bridge: the
// GraphQL session, the LiveKit signal/media session, both at once, and the
// server-side eject + rejoin that a long GraphQL outage produces.
test.describe('LiveKit reconnection', { tag: ['@ci', '@media'] }, () => {
  test.beforeEach(() => {
    test.skip(!isLiveKit, 'reconnection paths under test are specific to the LiveKit bridge');
  });

  test('room options reach livekit-client', async ({ browser }, testInfo) => {
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { viewerPage } = fixture;

    await expectViewerAudioFlowing(fixture);
    // The registry must hand livekit-client the options BBB configures; a copy
    // that the SDK never reads would make the rest of this file lie.
    const options = await getRoomOptionsState(viewerPage.page);
    expect(options?.sharedWithLocalParticipant, 'room options should be the object the SDK reads').toBe(true);
    expect(options?.stopLocalTrackOnUnpublish, 'a server-side unpublish should not stop the local capture').toBe(false);
    expect(options?.dynacast, 'dynacast should be on as configured').toBe(true);
  });

  test('a user ejected by the user-left sweep is heard again after rejoining', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 4 + PASSIVE_REMOVAL_WAIT_TIME + REJOIN_WAIT_TIME * 2);
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { modPage, viewerPage, viewerUserId } = fixture;

    await expectViewerAudioFlowing(fixture);
    expect(await tagPrimaryRoom(viewerPage.page, 'before-eject'), 'should expose the viewer LiveKit room').toBe(true);

    await ejectViewerByUserLeftSweep(fixture);
    fixture.restoreGraphql();
    await fixture.waitForGraphqlReconnected(REJOIN_WAIT_TIME);
    await expectViewerRejoined(fixture);

    // Every bridge and hook on the page holds the primary Room; a rejoin must
    // reconnect that object, not swap it for one nobody else knows about.
    expect(await getPrimaryRoomTag(viewerPage.page), 'the rejoin should reconnect the same primary Room object').toBe(
      'before-eject',
    );

    // The removal fenced the voice record as muted; the unmute is the user's.
    await viewerPage.hasElement(
      e.unmuteMicButton,
      'the rejoined viewer should come back muted',
      ELEMENT_WAIT_LONGER_TIME,
    );
    await unmuteViewer(fixture);
    await expectViewerAudioFlowing(fixture);
    await expectMicUiMatchesPublication(fixture);
    expect(fixture.viewerLogCodes, 'no publish should have hit a torn-down room').not.toContain(
      'livekit_audio_set_sender_track_error',
    );
    expect(await getAudioPublisherIdentities(modPage.page)).toContain(viewerUserId);
  });

  test('a full reconnect while muted keeps the user muted and silent', async ({ browser }, testInfo) => {
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { viewerPage } = fixture;

    await expectViewerAudioFlowing(fixture);
    await muteViewer(fixture);
    await viewerPage.page.waitForTimeout(UNPUBLISH_SETTLE_TIME);
    await expectViewerSilent(fixture, 'the muted viewer should not publish before the reconnect');

    await simulateRoomScenario(viewerPage.page, 'full-reconnect');
    await waitForRoomReconnected(viewerPage.page);

    // A full reconnect is a participant leave + join on the server; the
    // client must not read that as a transfer and unmute on its own.
    await viewerPage.hasElement(e.unmuteMicButton, 'the viewer should still be shown as muted after the reconnect');
    await expectViewerSilent(fixture, 'the muted viewer should stay silent across a full reconnect');
    await expectMicUiMatchesPublication(fixture);

    await unmuteViewer(fixture);
    await expectViewerAudioFlowing(fixture);
  });

  test('a full reconnect while unmuted keeps the mic and honours a later mute', async ({ browser }, testInfo) => {
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { viewerPage } = fixture;

    await expectViewerAudioFlowing(fixture);
    await simulateRoomScenario(viewerPage.page, 'full-reconnect');
    await waitForRoomReconnected(viewerPage.page);

    await expectViewerAudioFlowing(fixture);
    await expectMicUiMatchesPublication(fixture);

    await muteViewer(fixture);
    await viewerPage.page.waitForTimeout(UNPUBLISH_SETTLE_TIME);
    await expectViewerSilent(fixture, 'a mute after a full reconnect should silence the viewer');
    await expectMicUiMatchesPublication(fixture);
    // A publish queued during the reconnect must not duplicate the SDK's own
    // republish and escalate into a second, forced reconnect.
    expect(fixture.viewerLogCodes, 'no publish should have been escalated into a forced reconnect').not.toContain(
      'livekit_audio_fatal_publish_error_reconnect',
    );

    await unmuteViewer(fixture);
    await expectViewerAudioFlowing(fixture);
  });

  test('a server-side leave is reconnected without a rejoin', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 4 + RECONNECT_WAIT_TIME * 2);
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { viewerPage } = fixture;

    await expectViewerAudioFlowing(fixture);
    expect(await tagPrimaryRoom(viewerPage.page, 'before-leave')).toBe(true);
    // The server tells the client to leave; the SDK disconnects and does not
    // retry, and the membership row survives, so nothing remounts the room.
    await simulateRoomScenario(viewerPage.page, 'server-leave');
    await waitForRoomReconnected(viewerPage.page);

    expect(await getPrimaryRoomTag(viewerPage.page), 'the same primary Room should be reconnected').toBe(
      'before-leave',
    );
    // The voice record is re-created without a track when the participant
    // rejoins, so the user comes back muted; what must hold is consistency,
    // and that an unmute restores audio on the reconnected room.
    await expectMicUiMatchesPublication(fixture);
    if (await viewerPage.checkElement(e.unmuteMicButton)) await unmuteViewer(fixture);
    await expectViewerAudioFlowing(fixture);
  });

  test('a signal reconnect keeps the mic and the camera', async ({ browser }, testInfo) => {
    const fixture = await initReconnectionScenario(browser, testInfo, { webcam: true });
    const { modPage, viewerPage, viewerUserId } = fixture;

    await expectViewerAudioFlowing(fixture);
    const before = await getLocalMicState(viewerPage.page);
    const cameraBefore = await getLocalCameraState(viewerPage.page);
    expect(cameraBefore.publications, 'the viewer should publish a camera').toBeGreaterThan(0);

    await simulateRoomScenario(viewerPage.page, 'signal-reconnect');
    await waitForRoomReconnected(viewerPage.page);

    await expectViewerAudioFlowing(fixture);
    const after = await getLocalMicState(viewerPage.page);
    expect(after.trackSids, 'a signal resume should keep the same mic track').toEqual(before.trackSids);
    expect(
      (await getLocalCameraState(viewerPage.page)).trackSids,
      'a signal resume should keep the same camera track',
    ).toEqual(cameraBefore.trackSids);
    await expect(async () => {
      expect(
        await getLiveCameraIdentities(modPage.page),
        'the moderator should still receive the viewer camera',
      ).toContain(viewerUserId);
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
  });

  test('a short GraphQL outage leaves the media session untouched', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 4 + REJOIN_WAIT_TIME * 2);
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { modPage, viewerPage, viewerUserId } = fixture;

    await expectViewerAudioFlowing(fixture);
    const before = await getLocalMicState(viewerPage.page);
    expect(await tagPrimaryRoom(viewerPage.page, 'before-outage')).toBe(true);
    await startMicUiWatch(viewerPage.page);
    // The client retries a flat 10 s after a failure, so the outage runs to the
    // next retry whatever the cut length; that is inside the user-left sweep's
    // 10 s flag + 10 s tick, so the case also proves the sweep did not win.
    await fixture.cutGraphql();
    await viewerPage.page.waitForTimeout(5_000);
    fixture.restoreGraphql();
    await fixture.waitForGraphqlReconnected(REJOIN_WAIT_TIME);
    expect(
      await getMeetingUserIds(modPage.page),
      'the outage should end before the user-left sweep ejects the viewer',
    ).toContain(viewerUserId);
    // The record-driven mute button must not read as muted while the
    // microphone keeps sending through the outage.
    await viewerPage.hasElement(
      e.muteMicButton,
      'the viewer should be shown unmuted after the outage',
      REJOIN_WAIT_TIME,
    );
    const samples = await stopMicUiWatch(viewerPage.page);
    expect(samples.length, 'the mic button watch should have sampled the outage').toBeGreaterThan(0);
    expect(
      samples.filter((sample) => sample.showsMuted && sample.trackUnmuted),
      'the mic button should never show muted while the microphone is sending',
    ).toEqual([]);

    expect(await getPrimaryRoomTag(viewerPage.page), 'a GraphQL outage should not touch the LiveKit room').toBe(
      'before-outage',
    );
    await expectViewerAudioFlowing(fixture);
    expect((await getLocalMicState(viewerPage.page)).trackSids, 'the mic track should be the same').toEqual(
      before.trackSids,
    );
    await muteViewer(fixture);
    // The mute toggle is throttled; a second click inside the window is dropped.
    await viewerPage.page.waitForTimeout(UNPUBLISH_SETTLE_TIME);
    await unmuteViewer(fixture);
    await expectViewerAudioFlowing(fixture);
  });

  test('media resumes after a short offline period', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 6);
    const fixture = await initReconnectionScenario(browser, testInfo, { webcam: true });
    const { modPage, viewerPage, viewerUserId } = fixture;

    await expectViewerAudioFlowing(fixture);
    await startRoomStateWatch(viewerPage.page);
    await viewerPage.page.context().setOffline(true);
    await viewerPage.page.waitForTimeout(8_000);
    await viewerPage.page.context().setOffline(false);
    await waitForRoomReconnected(viewerPage.page);
    const states = await stopRoomStateWatch(viewerPage.page);
    // Without this the case would pass on an emulation that never reached the media path.
    expect(
      states.some((state) => state !== 'connected'),
      'the offline period should interrupt the LiveKit session',
    ).toBe(true);

    await expect(async () => {
      await expectViewerAudioFlowing(fixture);
      expect(
        await getLiveCameraIdentities(modPage.page),
        'the moderator should receive the viewer camera again',
      ).toContain(viewerUserId);
    }).toPass({ timeout: ELEMENT_WAIT_EXTRA_LONG_TIME * 2 });
    await expectMicUiMatchesPublication(fixture);
  });

  test('an unmute during a signal stall ends in a consistent state', async ({ browser }, testInfo) => {
    test.setTimeout(ELEMENT_WAIT_EXTRA_LONG_TIME * 4 + RECONNECT_WAIT_TIME);
    const fixture = await initReconnectionScenario(browser, testInfo);
    const { viewerPage } = fixture;

    await expectViewerAudioFlowing(fixture);
    await muteViewer(fixture);
    await viewerPage.page.waitForTimeout(UNPUBLISH_SETTLE_TIME);

    fixture.stallLiveKitSignal();
    await viewerPage.waitAndClick(e.unmuteMicButton);
    await viewerPage.page.waitForTimeout(5_000);
    await fixture.dropLiveKitSignal();

    await waitForRoomReconnected(viewerPage.page);

    // Whether the stalled unmute survives is the server's call; what must not
    // happen is a mic shown as open with nothing behind it.
    await expectMicUiMatchesPublication(fixture);
    if (await viewerPage.checkElement(e.unmuteMicButton)) await unmuteViewer(fixture);
    await expectViewerAudioFlowing(fixture);
  });
});
