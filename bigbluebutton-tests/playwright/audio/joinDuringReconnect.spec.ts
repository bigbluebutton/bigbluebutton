import { test } from '@playwright/test';

import { elements as e } from '../core/elements';
import { isLiveKit } from '../core/livekit';
import { Audio } from './audio';
import { connectMicrophone } from './util';

type TestWindow = Window & {
  BBB_EXPOSE_LIVEKIT_ROOM?: boolean;
  liveKitRooms?: { getPrimary: () => { simulateScenario: (scenario: string) => Promise<void> } };
};

// A LiveKit resume ends in Reconnected and never emits Connected, so anything
// that waits for a room connection must accept both. When it does not, an audio
// join placed during a resume sits for the whole ROOM_CONNECTION_TIMEOUT (15s)
// with joinInFlight set, which also defers any mic-room switch requested in
// the meantime.
test.describe('Audio join during a LiveKit resume', { tag: ['@ci', '@media'] }, () => {
  let audio: Audio;

  test.beforeEach(async ({ browser }, testInfo) => {
    const context = await browser.newContext();
    audio = new Audio(browser, context);
    const page = await context.newPage();
    await page.addInitScript(() => {
      (window as TestWindow).BBB_EXPOSE_LIVEKIT_ROOM = true;
    });
    await audio.initModPage(page, { testInfo });
  });

  test('joins audio while the primary room is resuming', async () => {
    test.skip(!isLiveKit, 'the resume/Reconnected contract is specific to the LiveKit audio bridge');
    const { modPage } = audio;
    if (!modPage) throw new Error('modPage not initialized');

    await modPage.waitForSelector(e.whiteboard);
    // Force the SDK's own signal-resume path, then join across it.
    await modPage.page.evaluate(async () => {
      const w = window as TestWindow;
      if (!w.liveKitRooms) throw new Error('window.liveKitRooms not exposed - BBB_EXPOSE_LIVEKIT_ROOM missing');
      await w.liveKitRooms.getPrimary().simulateScenario('signal-reconnect');
    });

    await modPage.waitAndClick(e.joinAudio);
    await connectMicrophone(modPage);
    await modPage.hasElement(e.unmuteMicButton, 'audio should join while the room resumes');
  });
});
