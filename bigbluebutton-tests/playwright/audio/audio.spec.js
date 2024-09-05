const { test } = require('../fixtures');
const { fullyParallel } = require('../playwright.config');
const { Audio } = require('./audio');
const { initializePages } = require('../core/helpers');

test.describe('Audio', () => {
  const audio = new Audio();

  test.describe.configure({ mode: fullyParallel ? 'parallel' : 'serial' });
  test[fullyParallel ? 'beforeEach' : 'beforeAll'](async ({ browser }) => {
    await initializePages(audio, browser, { isMultiUser: true });
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#listen-only-mode-automated
  test('Join audio with Listen Only', { tag: '@ci' }, async () => {
    await audio.joinAudio();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#join-audio-automated
  test('Join audio with Microphone', { tag: '@ci' }, async () => {
    await audio.joinMicrophone();
  });

  test('Change audio input and keep it connected', async () => {
    await audio.changeAudioInput();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#muteunmute
  test('Mute yourself by clicking the mute button', { tag: '@ci' }, async () => {
    await audio.muteYourselfByButton();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#choosing-different-sources
  test('Keep the last mute state after rejoining audio', { tag: '@ci' }, async () => {
    await audio.keepMuteStateOnRejoin();
  });

  // Talking Indicator
  // https://docs.bigbluebutton.org/2.6/release-tests.html#talking-indicator
  test('Mute yourself by clicking the talking indicator', { tag: '@ci' }, async () => {
    await audio.muteYourselfByTalkingIndicator();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#talking-indicator
  test('Mute another user by clicking the talking indicator', { tag: '@ci' }, async () => {
    await audio.muteAnotherUser();
  });
});
