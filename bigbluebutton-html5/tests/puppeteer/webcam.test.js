const Share = require('./webcam/share');
const Check = require('./webcam/check');
const Page = require('./core/page');

describe('Webcam', () => {
  test('Shares webcam', async () => {
    const test = new Share();
    let response;
    try {
      await test.init(Page.getArgsWithVideo());
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });

  test('Checks content of webcam', async () => {
    const test = new Check();
    let response;
    try {
      await test.init(Page.getArgsWithVideo());
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
