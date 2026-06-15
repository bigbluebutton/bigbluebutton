import { expect, type Page as PlaywrightPage } from '@playwright/test';

import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { Audio } from './audio';
import { connectMicrophone } from './util';

// Minimal version of the LiveKit track publication object the test uses via
// window.liveKitRoom
interface TestMicPublication {
  source: string;
  isMuted: boolean;
  unmute: () => Promise<void>;
}
type TestWindow = Window & {
  BBB_EXPOSE_LIVEKIT_ROOM?: boolean;
  liveKitRoom?: { localParticipant: { audioTrackPublications: Map<string, TestMicPublication> } };
};

interface MicMuteState {
  hasRoom: boolean;
  count: number;
  allMuted: boolean;
}

// Reads the local microphone publications' mute state. count === 0 means no mic
// track is published (i.e. effectively not sending audio).
const readLocalMicMuteState = (page: PlaywrightPage): Promise<MicMuteState> =>
  page.evaluate(() => {
    const room = (window as TestWindow).liveKitRoom;
    const pubs = room
      ? Array.from(room.localParticipant.audioTrackPublications.values()).filter((pub) => pub.source === 'microphone')
      : [];
    return { hasRoom: !!room, count: pubs.length, allMuted: pubs.length === 0 || pubs.every((pub) => pub.isMuted) };
  });

// Captures the the initial state and then unmutes the local mic track(s) directly via the
// LiveKit SDK, bypassing BBB's mute pipeline - in a single evaluation to stay
// within the ~5s unpublishOnMute window after a mute. This simulates the out-of-band
// track unmute seen during reconnects.
const snapshotThenUnmuteOutOfBand = (
  page: PlaywrightPage,
): Promise<{ hasRoom: boolean; countBefore: number; allMutedBefore: boolean }> =>
  page.evaluate(async () => {
    const room = (window as TestWindow).liveKitRoom;
    const pubs = room
      ? Array.from(room.localParticipant.audioTrackPublications.values()).filter((pub) => pub.source === 'microphone')
      : [];
    const snapshot = {
      hasRoom: !!room,
      countBefore: pubs.length,
      allMutedBefore: pubs.length === 0 || pubs.every((pub) => pub.isMuted),
    };
    await Promise.all(pubs.map((pub) => pub.unmute()));
    return snapshot;
  });

test.describe('Audio mute reinforcement', { tag: ['@ci', '@media'] }, () => {
  let audio: Audio;

  test.beforeEach(async ({ browser }, testInfo) => {
    const context = await browser.newContext();
    audio = new Audio(browser, context);
    const page = await context.newPage();
    // Opt in to exposing window.liveKitRoom for this test only
    await page.addInitScript(() => {
      (window as TestWindow).BBB_EXPOSE_LIVEKIT_ROOM = true;
    });
    await audio.initModPage(page, { testInfo });
  });

  // A viewer whose LiveKit mic track is unmuted out-of-band (e.g. during
  // reconnect) must not keep broadcasting audio while BBB shows them muted.
  test('re-mutes the LiveKit audio track when it is unmuted while the user is muted', async () => {
    test.skip(!isLiveKit, 'mute reinforcement is specific to the LiveKit audio bridge');
    const { modPage } = audio;
    if (!modPage) throw new Error('modPage not initialized');

    // Reach a published+muted state: join audio, unmute (publishes the track), then mute.
    await modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(modPage);
    await modPage.hasElement(e.unmuteMicButton, 'should join audio muted');
    await modPage.waitAndClick(e.unmuteMicButton);
    await modPage.hasElement(e.isTalking, 'should be unmuted/talking after clicking unmute');
    await audio.muteButtonCooldown();
    await modPage.waitAndClick(e.muteMicButton);
    await modPage.hasElement(e.unmuteMicButton, 'BBB should show the user as muted');

    // Snapshot the published+muted precondition and trigger the desync in one step:
    // a muted mic track is unmuted directly, behind BBB's back.
    const before = await snapshotThenUnmuteOutOfBand(modPage.page);
    expect(before.hasRoom, 'liveKitRoom should be exposed for testing').toBeTruthy();
    expect(before.countBefore, 'a mic track should be published while muted').toBeGreaterThan(0);
    expect(before.allMutedBefore, 'the mic track should be muted before the out-of-band unmute').toBeTruthy();

    // BBB's authoritative state stays muted (no track_unmuted is relayed to the server).
    await modPage.hasElement(e.unmuteMicButton, 'BBB should still show the user as muted');

    // Invariant: the bridge must reinforce the muted state back onto the LiveKit track,
    // so no audio flows while BBB believes the user is muted.
    await expect(async () => {
      const after = await readLocalMicMuteState(modPage.page);
      expect(after.allMuted, 'the LiveKit mic track must be re-muted to match BBB mute state').toBeTruthy();
    }).toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
  });
});
