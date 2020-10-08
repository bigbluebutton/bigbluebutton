const Page = require('./core/page');
const Draw = require('./whiteboard/draw');
const { toMatchImageSnapshot } = require('jest-image-snapshot');

expect.extend({ toMatchImageSnapshot });

const whiteboardTest = () => {
  beforeEach(() => {
    jest.setTimeout(30000);
  });

  test('Draw rectangle', async () => {
    const test = new Draw();
    let response;
    let screenshot;
    try {
      await test.init(Page.getArgs());
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
        failureThreshold: 0.005,
        failureThresholdType: 'percent',
      });
    }
  });
};
module.exports = exports = whiteboardTest;
