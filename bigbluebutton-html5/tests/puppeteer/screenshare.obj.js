const ShareScreen = require('./screenshare/screenshare');
const Page = require('./core/page');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const screenShareTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Share screen', async () => {
    const test = new ShareScreen();
    let response;
    let screenshot;
    try {
      await test.init(Page.getArgsWithVideo());
      await test.closeAudioModal();
      response = await test.test();
      screenshot = await test.page.screenshot();
    } catch (e) {
      console.log(e);
    } finally {
      await test.close();
    }
    expect(response).toBe(true);
    if (process.env.REGRESSION_TESTING === 'true') {
      expect(screenshot).toMatchImageSnapshot({
        failureThreshold: 1.37,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = screenShareTest;
