const { test } = require('@playwright/test');
const { Audio } = require('./audio');

test.describe.parallel('Audio', () => {
  test('Join audio with Listen Only', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.joinAudio();
  });

  test('Join audio with Microphone', async ({ browser, page }) => {
    const audio = new Audio(browser, page);
    await audio.init(true, false);
    await audio.joinMicrophone();
  });
});
