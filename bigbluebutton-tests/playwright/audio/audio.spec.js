const { test } = require('@playwright/test');
const { Audio } = require('./audio');

test.describe.parallel('Audio', () => {
  // https://docs.bigbluebutton.org/2.5/release-tests.html#listen-only-mode-automated
  test('Join audio with Listen Only @ci', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.joinAudio();
  });

  // https://docs.bigbluebutton.org/2.5/release-tests.html#join-audio-automated
  test('Join audio with Microphone @ci', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.joinMicrophone();
  });
});
