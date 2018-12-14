const Page = require('./core/page');
const Status = require('./user/status');

describe('User', () => {
  test('Change status', async () => {
    const test = new Status();
    let response;
    try {
      await test.init(Page.getArgs());
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
