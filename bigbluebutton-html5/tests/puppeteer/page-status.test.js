const Page = require('./page');
const StatusTestPage = require('./page-status');

test("Tests setting/changing/clearing a user's status", async () => {
  const test = new StatusTestPage();
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
