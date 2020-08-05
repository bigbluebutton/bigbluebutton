const Page = require('./core/page');
const Status = require('./user/status');
const MultiUsers = require('./user/multiusers');

const userTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Change status', async () => {
    const test = new Status();
    let response;
    try {
      await test.init(Page.getArgs());
      await test.closeAudioModal();
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
      await test.page1.closeAudioModal();
      await test.page2.closeAudioModal();
      response = await test.test();
    } catch (err) {
      console.log(err);
    } finally {
      await test.close(test.page1, test.page2);
    }
    expect(response).toBe(true);
  });
};
module.exports = exports = userTest;
