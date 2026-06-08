import { ELEMENT_WAIT_LONGER_TIME } from '../core/constants';
import { elements as e } from '../core/elements';
import { initializePages } from '../core/helpers';
import { isLiveKit } from '../core/livekit';
import { test } from '../core/setup/fixtures';
import { Audio } from './audio';

test.describe.parallel('Audio', { tag: ['@ci', '@media'] }, () => {
  let audio: Audio;

  test.beforeEach(async ({ browser, context }, testInfo) => {
    audio = new Audio(browser, context);
    await initializePages(audio, browser, { isMultiUser: true, testInfo });
    // LiveKit auto-joins audio (muted) when the modal is closed. Wait for the
    // connection to settle, then leave audio so tests start from a clean state
    // (user not in audio).
    if (isLiveKit) {
      await audio.modPage.waitForSelector(e.audioDropdownMenu, ELEMENT_WAIT_LONGER_TIME);
      await audio.modPage.leaveAudio();
      if (audio.userPage) {
        await audio.userPage.waitForSelector(e.audioDropdownMenu, ELEMENT_WAIT_LONGER_TIME);
        await audio.userPage.leaveAudio();
      }
    }
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#listen-only-mode-automated
  test('Join audio with Listen Only', async () => {
    test.skip(isLiveKit, 'LiveKit does not have a dedicated listen-only mode');
    await audio.joinAudio();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#join-audio-automated
  test('Join audio with Microphone', async () => {
    await audio.joinMicrophone();
  });

  test('Change audio input and keep it connected', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not support fake audio to simulate de audio.');
    await audio.changeAudioInput();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#muteunmute
  test('Mute yourself by clicking the mute button', async () => {
    await audio.muteYourselfByButton();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#choosing-different-sources
  test('Keep the last mute state after rejoining audio', async () => {
    await audio.keepMuteStateOnRejoin();
  });

  // Talking Indicator
  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#talking-indicator
  test('Mute yourself by clicking the talking indicator', async () => {
    await audio.muteYourselfByTalkingIndicator();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#talking-indicator
  test('Mute another user by clicking the talking indicator', async () => {
    await audio.muteAnotherUser();
  });
});
