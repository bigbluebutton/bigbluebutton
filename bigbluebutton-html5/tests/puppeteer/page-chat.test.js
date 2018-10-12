const Page = require('./page');
const ChatTestPage = require('./page-chat');

test('Tests sending a message in chat', async () => {
  const test = new ChatTestPage();
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
