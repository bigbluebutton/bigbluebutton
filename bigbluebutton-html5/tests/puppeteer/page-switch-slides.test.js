const Page = require('./page');
const SlideSwitchTestPage = require('./page-switch-slides');

test('Tests switching slides', async () => {
  const test = new SlideSwitchTestPage();
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
