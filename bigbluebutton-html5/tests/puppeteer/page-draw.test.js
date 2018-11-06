const Page = require('./page');
const DrawTestPage = require('./page-draw');

test('Tests drawing a box on the whiteboard', async () => {
  const test = new DrawTestPage();
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
