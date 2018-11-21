const Page = require('./page');
const Send = require('./chat/send');
const Clear = require('./chat/clear');

describe('Chat tests', () => {

  test('Tests sending a message in chat', async () => {
    const test = new Send();
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

  test('Tests cleaning a message in chat', async () => {
    const test = new Clear();
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

});
