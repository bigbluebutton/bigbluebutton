import { expect } from '@playwright/test';

import { ELEMENT_WAIT_EXTRA_LONG_TIME, ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import {
  dropLiveKitParticipant,
  exposeLiveKitRooms,
  getPrimaryRoomState,
  isLiveKit,
  routeLiveKitSignal,
} from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { Audio } from './audio';
import { connectMicrophone, ensureUnmuted } from './util';

// LK reconn is usually kicked off on a 15s ping timeout. Double that for recovery.
const LK_RECONN_TIME = 2 * ELEMENT_WAIT_EXTRA_LONG_TIME;

// A server-initiated LK participant disconnect is not necessarily noticed by
// the client immediately. The BBB core enforces that at once, though,
// which creates a state desync in the client (client shows as not-in-audio,
// but the LK bridge still thinks it is connected). The client should behave
// properly on that scenario: if a user tries to rejoin audio while in that state,
// it should eventually be reconnected with the expected previous state persisted.
test.describe('Audio join after a server-side LiveKit drop', { tag: ['@ci', '@media'] }, () => {
  test('keeps the microphone when join audio is clicked before the client notices the drop', async ({
    browser,
    context,
    page,
  }, testInfo) => {
    test.skip(!isLiveKit, 'the server-side participant close is specific to the LiveKit audio bridge');
    const audio = new Audio(browser, context);
    await exposeLiveKitRooms(page);
    const signal = await routeLiveKitSignal(page);
    await audio.initModPage(page, { testInfo });
    const { modPage } = audio;

    await modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(modPage);
    await modPage.waitAndClick(e.unmuteMicButton);
    await modPage.hasElement(e.isTalking, 'should be talking before the drop');
    const { sid: droppedSid } = await getPrimaryRoomState(page);

    // Trigger a server-side participant drop via a signaling block.
    expect(signal.hold(), 'the LiveKit signal socket should be routed').toBeGreaterThan(0);
    await dropLiveKitParticipant(page);

    await modPage.hasElement(e.joinAudio, 'the server should have removed the user from voice');
    expect(
      (await getPrimaryRoomState(page)).state,
      'the client should still consider the room connected when join audio is clicked',
    ).toBe('connected');
    // The client recovers the microphone by itself, so the end state alone
    // cannot tell a rejoin from a click routed to the audio modal.
    await page.evaluate((selector) => {
      const w = window as unknown as { audioModalOpened?: boolean };
      w.audioModalOpened = !!document.querySelector(selector);
      new MutationObserver((mutations, observer) => {
        const opened = mutations.some((mutation) =>
          Array.from(mutation.addedNodes).some(
            (node) => node instanceof Element && (node.matches(selector) || !!node.querySelector(selector)),
          ),
        );
        if (!opened) return;
        w.audioModalOpened = true;
        observer.disconnect();
      }).observe(document.body, { childList: true, subtree: true });
    }, e.audioModal);
    await modPage.waitAndClick(e.joinAudio);

    await expect
      .poll(async () => (await getPrimaryRoomState(page)).sid, {
        message: 'the client should reconnect as a new participant',
        timeout: LK_RECONN_TIME,
      })
      .not.toBe(droppedSid);
    await modPage.wasRemoved(e.joinAudio, 'should be back in audio after the drop', LK_RECONN_TIME);
    await expect(async () => {
      await ensureUnmuted(modPage);
    }, 'should talk through the microphone again after the drop').toPass({ timeout: ELEMENT_WAIT_LONGER_TIME });
    expect(
      await page.evaluate(() => (window as unknown as { audioModalOpened?: boolean }).audioModalOpened),
      'the click should rejoin directly instead of opening the audio modal',
    ).toBe(false);
  });
});
