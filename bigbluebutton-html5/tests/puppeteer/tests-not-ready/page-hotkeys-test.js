const Page = require('./page');
const HotkeysTestPage = require('./page-hotkeys');

test('Tests hotkeys: Options, User List, Leave/Join Audio, Mute/Unmute, Toggle Public Chat, Actions Menu, Status Menu', async () => {
  const test = new HotkeysTestPage();
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
