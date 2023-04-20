const { test } = require('@playwright/test');
const { MultiUsers } = require('../user/multiusers');
const { Audio } = require('./audio');

test.describe.parallel('Audio', () => {
  // https://docs.bigbluebutton.org/2.6/release-tests.html#listen-only-mode-automated
  test('Join audio with Listen Only @ci', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.joinAudio();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#join-audio-automated
  test('Join audio with Microphone @ci', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.joinMicrophone();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#muteunmute
  test('Mute yourself by clicking the mute button @ci', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.muteYourselfByButton();
  });

  // https://docs.bigbluebutton.org/2.6/release-tests.html#choosing-different-sources
  test('Change audio input and keep it connected', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.changeAudioInput();
  });

  test('Keep the last mute state after rejoining audio @ci', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.keepMuteStateOnRejoin();
  });

  test.describe.parallel('Talking indicator @ci', () => {
    // https://docs.bigbluebutton.org/2.6/release-tests.html#talking-indicator
    test('Mute yourself by clicking the talking indicator', async ({ browser, page }) => {
      const audio = new Audio(browser, page);
      await audio.init(true, false);
      await audio.muteYourselfByTalkingIndicator();
    });

    // https://docs.bigbluebutton.org/2.6/release-tests.html#talking-indicator
    test('Mute another user by clicking the talking indicator', async ({ browser, context, page }) => {
      const audio = new MultiUsers(browser, context);
      await audio.initModPage(page);
      await audio.initUserPage(false);
      await audio.muteAnotherUser();
    });
  });
});
