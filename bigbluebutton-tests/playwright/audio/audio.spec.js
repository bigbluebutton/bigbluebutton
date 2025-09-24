const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { Audio } = require('./audio');
const { initializePages } = require('../core/helpers');

test.describe('Audio', { tag: '@ci' }, () => {
  const audio = new Audio();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }, testInfo) => {
    await initializePages(audio, browser, { isMultiUser: true, testInfo });
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#listen-only-mode-automated
  test('Join audio with Listen Only', async () => {
    await audio.joinAudio();
  });

  // https://docs.bigbluebutton.org/3.0/testing/release-testing/#join-audio-automated
  test('Join audio with Microphone', async () => {
    await audio.joinMicrophone();
  });

  test('Change audio input and keep it connected', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Firefox does not support fake audio to simulate de audio.')
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
