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
  test('Join audio with Listen Only @ci', async () => {
    await audio.joinAudio();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#join-audio-automated
  test('Join audio with Microphone @ci', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Audio tests not working properly on automated tests.');
    await audio.joinMicrophone();
  });

  test('Change audio input and keep it connected', async () => {
    await audio.changeAudioInput();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#muteunmute
  test('Mute yourself by clicking the mute button @ci', async () => {
    await audio.muteYourselfByButton();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#choosing-different-sources
  test('Keep the last mute state after rejoining audio @ci', async ({ browserName }) => {
    test.skip(browserName === 'firefox', 'Audio tests not working properly on automated tests.');
    await audio.keepMuteStateOnRejoin();
  });

  // Talking Indicator
  // https://docs.bigbluebutton.org/2.6/release-tests.html#talking-indicator
  test('Mute yourself by clicking the talking indicator @ci', async () => {
    await audio.muteYourselfByTalkingIndicator();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#talking-indicator
  test('Mute another user by clicking the talking indicator @ci', async () => {
    await audio.muteAnotherUser();
  });
});
