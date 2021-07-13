const Page = require('./page');
const HotkeysMicFirstTestPage = require('./page-hotkeys-mic-first');

test('Tests hotkeys when a user first joins a meeting with a microphone: Leaving audio, rejoining as Listen Only, then rejoining with microphone', async () => {
  const test = new HotkeysMicFirstTestPage();
  try {
    await test.init(Page.getArgs());
    await test.test();
    await test.close();
  } catch (e) {
    console.log(e);
    await test.close();
    throw new Error('Test failed');
  }
});
