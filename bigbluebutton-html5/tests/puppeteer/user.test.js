const Page = require('./core/page');
const Status = require('./user/status');
const MultiUsers = require('./user/multiusers');

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

  test('Multi user presence check', async () => {
    const test = new MultiUsers();
    let response;
    try {
      await test.init();
      response = await test.test();
    } catch (err) {
      console.log(err);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
});
