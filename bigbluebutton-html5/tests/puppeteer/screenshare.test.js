const ShareScreen = require('./screenshare/screenshare');
const Page = require('./core/page');

describe('Screen Share', () => {
  test('Share screen', async () => {
    const test = new ShareScreen();
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
