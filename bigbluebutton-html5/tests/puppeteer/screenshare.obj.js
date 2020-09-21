const ShareScreen = require('./screenshare/screenshare');
const Page = require('./core/page');

const screenShareTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Share screen', async () => {
    const test = new ShareScreen();
    let response;
    try {
      await test.init(Page.getArgsWithVideo());
      await test.closeAudioModal();
      response = await test.test();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
  });
};
module.exports = exports = screenShareTest;
